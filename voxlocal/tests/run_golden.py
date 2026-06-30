"""Runner du golden test set : passe les transcripts de référence dans mcp-transcript-qa
et vérifie le comportement attendu (non-régression du garde-fou zéro-mensonge).

Lancer : py voxlocal/tests/run_golden.py
Sortie : code 0 si tous PASS, 1 sinon.
"""
import importlib.util
import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # voxlocal/


def load(name):
    path = os.path.join(ROOT, "mcp", name, "server.py")
    spec = importlib.util.spec_from_file_location(f"vox_{name}", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def check(expect, score, nflags):
    if "max_flags" in expect and nflags > expect["max_flags"]:
        return False
    if "min_flags" in expect and nflags < expect["min_flags"]:
        return False
    if "min_score" in expect and score < expect["min_score"]:
        return False
    if "max_score" in expect and score > expect["max_score"]:
        return False
    return True


def main():
    qa = load("transcript_qa")
    with open(os.path.join(os.path.dirname(__file__), "golden", "btp.json"), encoding="utf-8") as f:
        cases = json.load(f)

    fails = 0
    for c in cases:
        r = qa.check_transcript(c["transcript"], c["kb"])
        ok = check(c["expect"], r["reliability_score"], len(r["flags"]))
        print(f"[{'PASS' if ok else 'FAIL'}] {c['name']:<26} score={r['reliability_score']:>2} flags={len(r['flags'])}")
        if not ok:
            fails += 1

    print(f"\n{len(cases) - fails}/{len(cases)} PASS")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
