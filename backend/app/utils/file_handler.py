import os
import shutil
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class FileHandler:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        try:
            file_path = UPLOAD_DIR / upload_file.filename
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
            return str(file_path)
        except Exception as e:
            # In a real app, log this
            print(f"Error saving file: {e}")
            raise e
