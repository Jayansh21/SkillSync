import requests
from bs4 import BeautifulSoup
from PIL import Image
import io
import fitz  # PyMuPDF
# OR standard file handling if using simple libraries

class JDParser:
    @staticmethod
    def extract_from_text(text: str) -> str:
        return text.strip()

    @staticmethod
    def extract_from_url(url: str) -> str:
        try:
            # Basic headers to avoid immediate 403s
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            
            # Break into lines and remove leading/trailing space on each
            lines = (line.strip() for line in text.splitlines())
            # Break multi-headlines into a line each
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            # Drop blank lines
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text[:10000] # Limit length
        except Exception as e:
            raise Exception(f"Failed to fetch content from URL: {str(e)}")

    @staticmethod
    def extract_from_pdf(file_bytes: bytes) -> str:
        try:
            # Using PyMuPDF or similar would be good, but we have fitz/pdfminer installed?
            # Let's use pdfminer or pypdf if available. 
            # I'll rely on a basic extraction. 
            # Re-using ResumeParser logic might be good but that takes file paths.
            # Here I have bytes.
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except ImportError:
            # Fallback if fitz not present, try standard pypdf? 
            # We already used ResumeParser -> check what it uses.
            # It uses pdfminer.six usually.
            from pdfminer.high_level import extract_text
            text = extract_text(io.BytesIO(file_bytes))
            return text
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def extract_from_image(file_bytes: bytes) -> str:
        # Explicitly removed as per requirements (Step 1682)
        raise ValueError("Image inputs and OCR are no longer supported. Please provide text or PDF.")
