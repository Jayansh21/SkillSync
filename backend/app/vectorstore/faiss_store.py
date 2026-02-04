import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Optional

class FAISSStore:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(FAISSStore, cls).__new__(cls)
        return cls._instance

    def __init__(self, dimension: int = 384, index_path: str = "faiss_index.bin"):
        # Singleton init check
        if hasattr(self, 'index'):
            return
            
        self.dimension = dimension
        self.index_path = index_path
        self.index = faiss.IndexFlatL2(dimension)
        self.doc_map: Dict[int, Dict] = {}  # Map FAISS ID to metadata
        self.current_id = 0
        # self.load() -> Moved to initialize()
        
    def initialize(self):
        """Explicitly load the index."""
        self.load()
        
    def add_vectors(self, vectors: List[List[float]], metadatas: List[dict] = None):
        if not vectors:
            return
            
        vectors_np = np.array(vectors).astype('float32')
        num_vectors = vectors_np.shape[0]
        
        # Add to index
        self.index.add(vectors_np)
        
        # Map IDs to metadata
        if metadatas:
            for i in range(num_vectors):
                # If we have less metadata items than vectors (e.g. 1 metadata for multiple chunks),
                # reuse the first one or handle accordingly. 
                # Here we assume 1 metadata dict per call or list matching vectors.
                # If metadatas is a list of same length, use it. 
                # If it's a single dict (common case for 1 resume -> N chunks), we duplicate it.
                
                meta = metadatas[i] if len(metadatas) == num_vectors else metadatas[0]
                self.doc_map[self.current_id] = meta
                self.current_id += 1
        else:
             self.current_id += num_vectors
             
        self.save() # Persist changes

    
    def get_all_resumes(self) -> List[Dict]:
        """Returns a list of unique resumes stored in the index."""
        unique_resumes = {}
        for meta in self.doc_map.values():
            r_id = meta.get("resume_id")
            if r_id and r_id not in unique_resumes:
                unique_resumes[r_id] = meta
        return list(unique_resumes.values())

    def delete_by_resume_id(self, resume_id: str):
        """
        Soft delete by removing from doc_map. 
        Note: FAISS IndexFlatL2 doesn't support easy row deletion without rebuilding.
        For a prototype, we just remove metadata so it won't be returned in search results or lists.
        Ideally we would rebuild the index, but that requires storing raw vectors separately.
        """
        keys_to_remove = [k for k, v in self.doc_map.items() if v.get("resume_id") == resume_id]
        for k in keys_to_remove:
            del self.doc_map[k]
            
        if keys_to_remove:
            self.save() # Persist changes
            
        return len(keys_to_remove) > 0

    def search(self, query_vector: List[float], k: int = 5, filter_resume_id: Optional[str] = None):
        query_np = np.array([query_vector]).astype('float32')
        # We might search and find deleted items (id still in FAISS index), so we request > k
        distances, indices = self.index.search(query_np, k * 3)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1:
                # Check if metadata still exists (wasn't deleted)
                metadata = self.doc_map.get(idx)
                if metadata:
                    # Filter check
                    if filter_resume_id and metadata.get("resume_id") != filter_resume_id:
                        continue
                    results.append((dist, idx, metadata))
        
        # Return only top k valid results
        return results[:k]
        
    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.index_path + ".meta", "wb") as f:
            pickle.dump(self.doc_map, f)
        
    def load(self):
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        if os.path.exists(self.index_path + ".meta"):
            with open(self.index_path + ".meta", "rb") as f:
                self.doc_map = pickle.load(f)
