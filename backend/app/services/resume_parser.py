import fitz  # PyMuPDF
from app.utils.text_cleaner import TextCleaner
import logging

logger = logging.getLogger(__name__)

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            
            return TextCleaner.clean_text(text)
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise ValueError(f"Could not parse PDF file: {e}")

    @staticmethod
    def extract_metadata(doc: fitz.Document, file_path: str) -> dict:
        metadata = doc.metadata
        return {
            "source": file_path,
            "page_count": doc.page_count,
            "author": metadata.get("author"),
            "creation_date": metadata.get("creationDate"),
            "producer": metadata.get("producer")
        }

    @staticmethod
    def parse_file(file_path: str) -> dict:
        if file_path.lower().endswith(".pdf"):
            try:
                doc = fitz.open(file_path)
                text = ""
                for page in doc:
                    text += page.get_text()
                
                cleaned_text = TextCleaner.clean_text(text)
                metadata = ResumeParser.extract_metadata(doc, file_path)
                
                return {
                    "content": cleaned_text,
                    "metadata": metadata
                }
            except Exception as e:
                logger.error(f"Error extracting text from PDF: {e}")
                raise ValueError(f"Could not parse PDF file: {e}")
        else:
            raise ValueError("Unsupported file format. Only PDF is supported.")
