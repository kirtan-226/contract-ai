#!/usr/bin/env python3
import sys, json, base64, io, re
from pypdf import PdfReader  # pip install pypdf

def extract_text_from_pdf_bytes(b: bytes, max_chars=200_000):
    reader = PdfReader(io.BytesIO(b))
    texts = []
    for page in reader.pages:
        try:
            txt = page.extract_text() or ""
        except Exception:
            txt = ""
        texts.append(txt)
    text = "\n".join(texts)
    # normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    if len(text) > max_chars:
        text = text[:max_chars]
    return text

def main():
    raw = sys.stdin.read() or "{}"
    payload = json.loads(raw)
    b64 = payload.get("b64", "")
    if not b64:
        print(json.dumps({"error": "no b64"}))
        return
    pdf_bytes = base64.b64decode(b64)
    text = extract_text_from_pdf_bytes(pdf_bytes)
    print(json.dumps({"text": text}))

if __name__ == "__main__":
    main()
