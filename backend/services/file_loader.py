from typing import Dict
import base64
from PyPDF2 import PdfReader
from io import BytesIO

def load_text_input(text: str) -> Dict:
    return {
        "type": "text",
        "content": text
    }

def load_image_bytes(image_bytes: bytes) -> Dict:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    return {
        "type": "image",
        "content": encoded
    }

def load_pdf_bytes(pdf_bytes: bytes) -> Dict:
    """
    Extract text from PDF and return as text input.
    """
    try:
        pdf_reader = PdfReader(BytesIO(pdf_bytes))
        text_content = ""
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text()
            if text:
                text_content += f"\n--- Page {page_num + 1} ---\n{text}\n"
        
        if not text_content.strip():
            return {
                "type": "text",
                "content": "Error: Could not extract text from PDF. The PDF may contain only images."
            }
        
        return {
            "type": "text",
            "content": text_content
        }
    except Exception as e:
        return {
            "type": "text",
            "content": f"Error extracting PDF text: {str(e)}"
        }
