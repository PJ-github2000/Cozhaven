import sys
from pypdf import PdfReader

try:
    reader = PdfReader("Business details and Product Info.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    with open("pdf_text.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("PDF read successfully")
except Exception as e:
    print("Error:", e)
