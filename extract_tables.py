import pdfplumber
import json

try:
    tables_data = []
    with pdfplumber.open("Business details and Product Info.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for j, table in enumerate(tables):
                tables_data.append({
                    "page": i + 1,
                    "table_index": j + 1,
                    "data": table
                })
    
    with open("pdf_tables.json", "w", encoding="utf-8") as f:
        json.dump(tables_data, f, indent=2, ensure_ascii=False)
    print(f"Extracted {len(tables_data)} tables successfully.")
except Exception as e:
    print("Error:", e)
