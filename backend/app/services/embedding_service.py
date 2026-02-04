from typing import List
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            # Load model once
            cls._model = SentenceTransformer('all-MiniLM-L6-v2')
        return cls._instance

    def _split_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks of approximately chunk_size words."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_chunk.append(word)
            current_length += 1
            
            if current_length >= chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_length = 0
                
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text string."""
        if not text.strip():
            return [0.0] * 384
        return self._model.encode(text).tolist()

    def generate_embeddings(self, text: str) -> List[List[float]]:
        """Split text into chunks and generate embeddings for each."""
        chunks = self._split_text(text)
        if not chunks:
            return []
        
        embeddings = self._model.encode(chunks)
        return embeddings.tolist()
