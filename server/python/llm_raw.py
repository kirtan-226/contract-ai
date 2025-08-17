#!/usr/bin/env python3
"""
stdin:
{ "prompt": "...", "provider": "hf|openai|mock", "model": "..." }

stdout:
{ "output": "RAW MODEL TEXT" }
"""
import os, sys, json, requests

def env(k, d=""):
    return os.environ.get(k, d)

# ---------- sanitizers (fixes HF “Harmony” invalid JSON errors) ----------
def _strip_invalid_surrogates(s: str) -> str:
    # Remove UTF-16 surrogate code points (unpaired emoji halves, etc.)
    return "".join(ch for ch in s if not (0xD800 <= ord(ch) <= 0xDFFF))

def _strip_control_chars(s: str) -> str:
    # Keep common whitespace, strip other control chars (NULL, ESC, etc.)
    return "".join(
        ch for ch in s
        if ch in ("\n", "\r", "\t") or (0x20 <= ord(ch) <= 0x10FFFF and ord(ch) != 0x7F)
    )

def sanitize_for_json(s: str) -> str:
    if not isinstance(s, str):
        s = str(s)
    s = s.replace("\x00", " ")  # remove NULLs
    s = _strip_invalid_surrogates(s)
    s = _strip_control_chars(s)
    return s

# ---------- providers ----------
def call_hf(prompt, model):
    url = "https://router.huggingface.co/v1/chat/completions"
    token = env("HF_TOKEN")
    if not token:
        raise RuntimeError("HF_TOKEN not set")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    body = {
        "model": model or "accounts/fireworks/models/gpt-oss-20b",  # good default for HF router
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1200,
        "temperature": 0.2,
    }
    r = requests.post(url, headers=headers, json=body, timeout=60)
    if not r.ok:
        # Show router's detailed error (e.g., invalid JSON, bad model id)
        raise RuntimeError(f"HF {r.status_code}: {r.text}")
    j = r.json()
    return j.get("choices", [{}])[0].get("message", {}).get("content", "")

def call_openai(prompt, model):
    url = "https://api.openai.com/v1/chat/completions"
    token = env("OPENAI_API_KEY")
    if not token:
        raise RuntimeError("OPENAI_API_KEY not set")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    body = {
        "model": model or "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1200,
        "temperature": 0.2,
    }
    r = requests.post(url, headers=headers, json=body, timeout=60)
    if not r.ok:
        raise RuntimeError(f"OpenAI {r.status_code}: {r.text}")
    j = r.json()
    return j.get("choices", [{}])[0].get("message", {}).get("content", "")

# ---------- main ----------
MAX_PROMPT_LEN = 16000  # tweak if needed

def main():
    try:
        inp = json.loads(sys.stdin.read() or "{}")
    except Exception:
        print(json.dumps({"output": "<bad input JSON>"}))
        return

    provider = (inp.get("provider") or env("MODEL_PROVIDER") or "hf").lower()
    model = inp.get("model") or env("MODEL_NAME") or "accounts/fireworks/models/gpt-oss-20b"
    prompt = inp.get("prompt") or ""

    # sanitize & truncate prompt to avoid HF Harmony errors
    prompt = sanitize_for_json(prompt)
    if len(prompt) > MAX_PROMPT_LEN:
        prompt = prompt[:MAX_PROMPT_LEN]

    if provider == "mock":
        out = f"<mock response>\n\n{prompt[:400]}..."
        print(json.dumps({"output": out}))
        return

    try:
        if provider == "openai":
            out = call_openai(prompt, model)
        else:  # default to HF router
            out = call_hf(prompt, model)
        # Optionally sanitize output too (generally not needed, but safe)
        out = sanitize_for_json(out)
        print(json.dumps({"output": out}))
    except Exception as e:
        print(json.dumps({"output": f"<llm error: {e}>"}))

if __name__ == "__main__":
    main()
