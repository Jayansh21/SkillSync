import re

class TextCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        
        # Normalize newlines
        text = text.replace('\r', '\n')
        
        # Remove multiple newlines
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # Remove extra spaces within lines
        text = re.sub(r'[ \t]+', ' ', text)
        
        return text.strip()
