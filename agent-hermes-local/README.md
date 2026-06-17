# 🧠 Hermès — Assistant IA Personnel

Agent IA  avec Dashboard Next.js local pour piloter un agent IA multi-modèle (Ollama / Claude / GPT / Gemini) avec mémoire persistante, intégrations Google et terminal WSL2 intégré.

---

## 🏗️ Architecture

```
E:\Hermes\
├── hermes-dashboard/     # App Next.js (interface web)
├── Memoire_IA/           # Mémoire persistante & logs IA
├── config/               # Directives & identité de l'agent
├── scripts/              # Utilitaires
├── deploy_hermes.sh      # Déploiement automatisé zero-touch
├── docker-compose.yml    # Orchestration Docker
└── .env                  # Clés API (non versionné)
```

## ✨ Fonctionnalités

- 💬 **Chat multi-modèle** — Ollama (Mistral, GLM-4), Claude, GPT-4, Gemini
- 🧠 **Mémoire persistante** — conversations, profil utilisateur, contexte long terme
- 📧 **Gmail / Google Calendar / Drive** — widgets intégrés
- 🖥️ **Terminal WSL2** — shell intégré avec `cd` stateful
- 📊 **Stats système** — CPU, RAM, processus en temps réel
- 🔒 **Sécurité** — headers HTTP, CSP, rate limiting, sandboxing Docker

---

## 🚀 Installation rapide (zero-touch)

### Prérequis

- Windows 10/11 avec **WSL2** (Ubuntu recommandé)
- **Docker Desktop** avec intégration WSL2 activée
- **Node.js 20+** dans WSL2
- **Ollama** installé sur Windows (optionnel pour les modèles locaux)

### Étape 1 — Cloner le projet

```bash
git clone https://github.com/Dow08/Agent-IA-personnalis-Assistant-personnalis-coeur-hermes-Ollama-mistral-kimi-glm-.git /mnt/e/Hermes
cd /mnt/e/Hermes
```

### Étape 2 — Déploiement automatisé

Le script `deploy_hermes.sh` analyse votre PC, recommande le modèle Ollama optimal selon votre RAM, génère la configuration et lance tout automatiquement :

```bash
chmod +x deploy_hermes.sh
./deploy_hermes.sh
```

Le script va :
1. Vérifier les dépendances (Docker, curl, jq...)
2. Analyser la RAM disponible → recommander le bon modèle Ollama
3. Générer `docker-compose.yml` et `config/SOUL.md`
4. Demander votre webhook Discord (optionnel) et choix du provider IA
5. Créer le `.env` avec vos clés
6. Lancer les conteneurs via Docker Compose

### Étape 3 — Ou installation manuelle du dashboard

```bash
cd hermes-dashboard
cp .env.example .env.local
# Éditer .env.local avec vos clés API
npm install
npm run dev
```

L'interface est accessible sur **http://localhost:3000**

---

## ⚙️ Configuration (.env.local)
<img width="1606" height="1052" alt="Capture d&#39;écran 2026-05-01 095721" src="https://github.com/user-attachments/assets/b3232e14-c012-4553-92b8-ec75459d697c" />
<img width="505" height="521" alt="Capture d&#39;écran 2026-04-30 122152" src="https://github.com/user-attachments/assets/c446b989-ef2b-4326-9269-8de882cd30da" />

```env
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (GPT-4)
OPENAI_API_KEY=sk-...

# Google (Gemini + Gmail/Calendar/Drive)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Ollama (local — aucune clé requise)
OLLAMA_URL=http://localhost:11434

# Discord (alertes optionnelles)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

---

## 🐳 Déploiement Docker (production)

```bash
docker compose up -d
# Interface : http://127.0.0.1:3000
# Logs : docker logs -f hermes-agent-core
```

## 🔄 PM2 (alternative sans Docker)

```bash
cd hermes-dashboard
npm run build
pm2 start ecosystem.config.js
pm2 status
```

---

## 📁 Structure du dashboard
<img width="1065" height="1050" alt="Capture d&#39;écran 2026-04-30 113831" src="https://github.com/user-attachments/assets/c7a23b84-1732-4b30-953c-e43ec1f79a06" />
<img width="1606" height="1052" alt="Capture d&#39;écran 2026-05-01 095721" src="https://github.com/user-attachments/assets/69b40e03-bdc9-4d0c-8b31-33f62e6a7185" />

```
hermes-dashboard/
├── app/
│   ├── api/              # Routes API (chat, mémoire, terminal, Gmail...)
│   └── page.tsx          # Page principale
├── components/           # UI (chat, terminal, sidebar, widgets...)
├── lib/                  # Auth, mémoire, modèles, rate limiting
└── ecosystem.config.js   # Config PM2
```

---

## 🔒 Sécurité

- Headers HTTP sécurisés (CSP, X-Frame-Options, HSTS)
- Rate limiting par IP (20 req/min terminal, 10 req/min chat)
- Sandboxing Docker (capabilities restreintes, réseau local uniquement)
- `.env` jamais versionné — utiliser `.env.example` comme base
- Terminal WSL2 : commandes filtrées (fork bomb, rm -rf /, exfiltration bloqués)

---

## 🧩 Modèles testés

| Modèle | RAM requise | Provider |
|--------|-------------|----------|
| Mistral 7B | 8 Go | Ollama local |
| GLM-4 | 8 Go | Ollama local |
| Claude Sonnet | API | Anthropic |
| GPT-4o | API | OpenAI |
| Gemini Pro | API | Google |

---

*Conçu pour WSL2 + Windows. SSD dédié E: recommandé pour les performances.*
