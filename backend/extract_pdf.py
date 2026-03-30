import pypdf
import os
import json
import re

def extract_pdf_text(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    all_text = ""
    for page in reader.pages:
        all_text += page.extract_text() + "\n--- PAGE ---\n"
    return all_text

if __name__ == "__main__":
    pdf_path = "Matrix Price List - 2025 Toronto Warehouse (1).pdf"
    if os.path.exists(pdf_path):
        text = extract_pdf_text(pdf_path)
        with open("pdf_extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text extracted to pdf_extracted_text.txt")
    else:
        print("PDF not found")
