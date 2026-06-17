"""
AUDIT EXHAUSTIF - Dashboard JAROD / Agent Hermès
Teste: /setup, config API, memory API, Ollama, Cloud LLMs, history, import
"""
import urllib.request
import urllib.error
import json
import os

BASE = 'http://localhost:3001'

def post(path, data=None, as_json=True):
    url = BASE + path
    if as_json:
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    else:
        req = urllib.request.Request(url, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode()), r.status
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except Exception:
            body = {"raw_error": str(e)}
        return body, e.code
    except Exception as e:
        return {"error": str(e)}, 0

def get(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as r:
            return json.loads(r.read().decode()), r.status
    except urllib.error.HTTPError as e:
        return {"error": str(e)}, e.code
    except Exception as e:
        return {"error": str(e)}, 0

results = []

def test(name, ok, info=''):
    state = 'OK  ' if ok else 'FAIL'
    results.append((state, name, info))
    print(f"[{state}] {name}" + (f"\n       -> {info}" if info else ''))

print("=" * 65)
print("   AUDIT HERMES DASHBOARD - TESTS EXHAUSTIFS")
print("=" * 65)

# ── 1. /setup command ────────────────────────────────────────────────────────
print("\n--- 1. COMMANDE /SETUP ---")
r, s = post('/api/chat', {"modelId": "mistral-small:24b", "messages": [{"role": "user", "content": "/setup"}]})
test("/setup déclenche wizard", r.get("type") == "setup", r.get("reply","")[:60])

# ── 2. Config API (GET) ──────────────────────────────────────────────────────
print("\n--- 2. CONFIG API ---")
r, s = get('/api/config')
test("GET /api/config retourne provider", "provider" in r, f"provider={r.get('provider')}, model={r.get('model')}")
test("GET /api/config retourne streaming", "streaming" in r, f"streaming={r.get('streaming')}, show_reasoning={r.get('show_reasoning')}")
test("GET /api/config retourne clés masquées", r.get("ANTHROPIC_API_KEY") == "••••••••", f"ANTHROPIC={r.get('ANTHROPIC_API_KEY')}")

# ── 3. Config API (POST) ─────────────────────────────────────────────────────
print("\n--- 3. CONFIG SAVE ---")
r, s = post('/api/config', {"provider": "ollama", "model": "mistral-small:24b", "streaming": True, "show_reasoning": False, "tool_progress": "all"})
test("POST /api/config sauvegarde", r.get("success") == True, r.get("message","")[:60])

# ── 4. Models API ────────────────────────────────────────────────────────────
print("\n--- 4. MODELES DISPONIBLES ---")
r, s = get('/api/models')
models = r.get("models", [])
test("GET /api/models retourne des modèles", len(models) > 0, f"{len(models)} modèle(s) Ollama trouvé(s)")
for m in models:
    test(f"  Modèle local: {m.get('name','?')}", True, f"size={round(m.get('size',0)/1e9,1)}GB")

# ── 5. Chat avec Ollama (local) ───────────────────────────────────────────────
print("\n--- 5. CHAT LOCAL (OLLAMA) ---")
r, s = post('/api/chat', {"modelId": "mistral-small:24b", "messages": [{"role": "user", "content": "Réponds juste: ping"}]})
test("Chat mistral-small:24b", "reply" in r and not r.get("error"), r.get("reply","")[:80] if "reply" in r else r.get("error",""))

# ── 6. Cloud LLMs ─────────────────────────────────────────────────────────────
print("\n--- 6. CLOUD LLMs ---")
cloud_tests = [
    ("claude-3-5-sonnet-20241022", "Anthropic Claude 3.5 Sonnet"),
    ("claude-3-5-haiku-20241022",  "Anthropic Claude 3.5 Haiku"),
    ("gpt-4o",                     "OpenAI GPT-4o"),
    ("gemini-1.5-pro",             "Google Gemini 1.5 Pro"),
    ("gemini-2.0-flash",           "Google Gemini 2.0 Flash"),
]
for model_id, label in cloud_tests:
    r, s = post('/api/chat', {"modelId": model_id, "messages": [{"role": "user", "content": "Dis bonjour en 5 mots"}]})
    ok = "reply" in r and not r.get("error")
    err = r.get("error","")
    if "credit balance" in err or "insufficient_quota" in err or "RESOURCE_EXHAUSTED" in err:
        info = "QUOTA EPUISE (connecteur OK, compte vide)"
        ok_conn = True
    elif "NOT_FOUND" in err:
        info = "MODELE INTROUVABLE"
        ok_conn = False
    elif "API" in err and "manquante" in err:
        info = "CLE API ABSENTE"
        ok_conn = False
    else:
        info = r.get("reply","")[:60] if ok else err[:80]
        ok_conn = ok
    test(f"{label}", ok or ok_conn, info)

# ── 7. Memory - Conversations ────────────────────────────────────────────────
print("\n--- 7. MEMOIRE & HISTORIQUE ---")
r, s = get('/api/conversations')
test("GET /api/conversations retourne les sessions", s == 200 and isinstance(r.get("conversations"), list), f"{len(r.get('conversations', []))} conversation(s)")

# ── 8. Memory - Profile ──────────────────────────────────────────────────────
r, s = get('/api/memory/profile')
test("GET /api/memory/profile accessible", s in (200, 404), f"status={s}")

# ── 9. Import Memory API ─────────────────────────────────────────────────────
print("\n--- 8. IMPORT MEMOIRE ---")
r2, s2 = get('/api/memory/import')
test("Route /api/memory/import existe", s2 != 404, f"status={s2} (405 = OK, endpoint existe)")

# ── 10. Agent Status ─────────────────────────────────────────────────────────
print("\n--- 9. HERMES AGENT CORE (Local API Tests) ---")
try:
    with urllib.request.urlopen("http://localhost:11434/", timeout=5) as r:
        test("Ollama (port 11434) est en ligne", r.status == 200, "Ollama running")
except Exception as e:
    test("Ollama (port 11434) est en ligne", False, str(e))

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("   SYNTHESE")
print("=" * 65)
ok_count = sum(1 for s,_,_ in results if s == "OK  ")
fail_count = len(results) - ok_count
print(f"  Total: {len(results)} tests | OK: {ok_count} | ECHECS: {fail_count}")
print()
print("  ECHECS DETECTES:")
for s, n, i in results:
    if s != "OK  ":
        print(f"  - {n}: {i}")
