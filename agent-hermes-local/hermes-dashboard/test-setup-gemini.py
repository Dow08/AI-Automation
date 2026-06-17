"""
Test complet de tous les modèles cloud du Dashboard JAROD
"""
import urllib.request
import json

def fetch_post(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.loads(response.read().decode('utf-8')), response.status
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode('utf-8'))
        except Exception:
            body = {"raw": str(e)}
        return body, e.code
    except Exception as e:
        return {"error": str(e)}, 0

BASE_URL = 'http://localhost:3001/api/chat'
MSG = [{"role": "user", "content": "Dis bonjour en 5 mots max."}]

tests = [
    ("SETUP /setup",        "mistral-small:24b", [{"role": "user", "content": "/setup"}]),
    ("Gemini 1.5 Pro",      "gemini-1.5-pro",    MSG),
    ("Gemini 1.5 Flash",    "gemini-1.5-flash",  MSG),
    ("Gemini 2.0 Flash",    "gemini-2.0-flash",  MSG),
    ("Claude 3.5 Sonnet",   "claude-3-5-sonnet-20241022", MSG),
    ("Claude 3.5 Haiku",    "claude-3-5-haiku-20241022",  MSG),
    ("GPT-4o",              "gpt-4o",            MSG),
]

print("=" * 60)
print("AUDIT DES MODELES - DASHBOARD JAROD")
print("=" * 60)

for name, model_id, messages in tests:
    res, status = fetch_post(BASE_URL, {"modelId": model_id, "messages": messages})
    ok = ("reply" in res and not res.get("error")) or res.get("type") == "setup"
    state = "OK" if ok else "FAIL"
    print(f"\n[{state}] {name} ({model_id})")
    if not ok:
        print(f"  Status: {status}")
        print(f"  Erreur: {res.get('error', res)}")
    else:
        reply = res.get("reply", "")
        print(f"  Reponse: {reply[:80]}")
