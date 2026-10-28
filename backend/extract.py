
import sys
from pypdf import PdfReader

path = sys.argv[1]  
reader = PdfReader(path)

print(f"Pages: {len(reader.pages)}")

for i, page in enumerate(reader.pages, start=1):
    text = page.extract_text() or ""
    print(f"\n--- Page {i} ({len(text)} chars) ---")
    print(text[:300])  