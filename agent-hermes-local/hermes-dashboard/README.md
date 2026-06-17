# Jarod Cowork — Agent Hermès Dashboard

Interface locale multi-LLM pour l'Agent Hermès (NousResearch). Dashboard Next.js avec chat, mémoire persistante, intégrations Google et terminal intégré.

---

## Prérequis

- [Node.js 18+](https://nodejs.org)
- [Ollama](https://ollama.com) installé et lancé localement
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows uniquement, pour Hermes Agent CLI)
- Un disque `E:\` dédié (mémoire et config de l'agent)

---

## Étape 1 — Installer l'Agent Hermes (NousResearch)

> ⚠️ Sur Windows, l'agent CLI Hermes tourne sous **WSL2** uniquement.

```bash
# Dans un terminal WSL2
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc

# Lancer le wizard de configuration (provider, clés API, mémoire)
hermes setup
```

Commandes utiles une fois installé :

| Commande | Description |
|---|---|
| `hermes` | Lancer l'interface CLI |
| `hermes model` | Changer de modèle LLM |
| `hermes setup` | Reconfigurer l'agent |
| `hermes doctor` | Diagnostiquer les problèmes |
| `hermes update` | Mettre à jour vers la dernière version |

---

## Étape 2 — Configurer Hermes pour utiliser le disque E:\

Sous WSL2, `E:\` est accessible via `/mnt/e/`. Pointer la mémoire et le workspace de Hermes vers le disque dédié :

```bash
hermes config set memory.path /mnt/e/Memoire_IA
hermes config set workspace /mnt/e/Hermes
```

Structure attendue sur `E:\` :

```
E:\
├── Hermes\
│   ├── .env               ← clés API (ANTHROPIC_API_KEY, OPENAI_API_KEY…)
│   ├── config\
│   │   └── SOUL.md        ← personnalité / system prompt de Jarod
│   └── hermes-dashboard\  ← ce projet (dashboard Next.js)
└── Memoire_IA\
    └── data\
        └── config.yaml    ← configuration provider/model/display
```

---

## Étape 3 — Lancer le Dashboard Jarod

> ⚠️ Le dashboard se lance **depuis WSL2** — le dossier `E:\` est monté en `/mnt/e/` sous WSL2.

```bash
# Dans un terminal WSL2
cd /mnt/e/Hermes/hermes-dashboard
npm install       # première fois uniquement
npm run dev       # démarre sur http://localhost:3001
```

Ouvrir [http://localhost:3001](http://localhost:3001) dans le navigateur.

> **Note** : Assurer qu'Ollama tourne en parallèle (`ollama serve`) pour les modèles locaux.

> **Si tu lances depuis Windows (PowerShell)**, Node.js doit être installé côté Windows (pas seulement dans WSL2) :
> ```powershell
> cd E:\Hermes\hermes-dashboard
> npm run dev
> ```

---

## Configuration des clés API

Éditer `E:\Hermes\.env` :

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

Les clés peuvent aussi être configurées directement depuis l'onglet **Paramètres** du dashboard.

---

## Architecture

```
hermes-dashboard/
├── app/
│   ├── page.tsx              ← layout principal
│   └── api/
│       ├── chat/             ← route chat multi-LLM
│       ├── config/           ← lecture/écriture config
│       ├── models/           ← liste modèles Ollama
│       ├── conversations/    ← historique
│       ├── memory/           ← mémoire utilisateur
│       ├── terminal/         ← terminal intégré (WSL2/PowerShell)
│       └── system/stats/     ← stats système
├── components/
│   ├── sidebar.tsx           ← navigation (Dashboard/Chat/Terminal/Historique/Paramètres)
│   ├── chat-panel.tsx        ← interface de chat
│   ├── terminal-panel.tsx    ← terminal intégré
│   ├── history-panel.tsx     ← historique conversations
│   ├── settings-panel.tsx    ← paramètres
│   └── dashboard-widgets.tsx ← widgets monitoring
└── lib/
    ├── models.ts             ← liste des modèles LLM disponibles
    └── memory.ts             ← gestion mémoire persistante
```

---

## Stack

- **Framework** : Next.js 14 (App Router) + TypeScript
- **UI** : TailwindCSS + shadcn/ui
- **LLMs locaux** : Ollama (`mistral-small:24b` par défaut)
- **LLMs cloud** : Anthropic Claude, OpenAI GPT-4o, Google Gemini
- **Mémoire** : JSON local dans `E:\Memoire_IA`

---

*Jarod Cowork v2 · seallia81 · [TryHackMe](https://tryhackme.com/p/seallia81)*
