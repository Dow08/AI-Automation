# 🛡️ CyberDailyWatch

**Agrégateur automatisé d'actualités cybersécurité avec briefings audio générés par IA**

Un système "Zero-Touch" qui récupère les actualités cyber, les résume avec l'IA, les convertit en audio (podcast), et met à jour un site web statique.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Fonctionnalités

- 🔍 **Scraping automatisé** - Récupère les dernières actualités de TheHackerNews
- 🤖 **Résumé par IA** - Génère des scripts radio en français avec GPT-4o-mini
- 🎙️ **Synthèse vocale** - Convertit le texte en audio avec edge-tts (voix française)
- 🌐 **Interface Cyberpunk** - Site web style terminal avec effets CRT
- ⚡ **Automation Zero-Touch** - GitHub Actions s'exécute tous les jours à 08h00 UTC

## 📁 Structure du Projet

```
CyberDailyWatch/
├── src/
│   ├── __init__.py
│   ├── scraper.py      # Scraper TheHackerNews
│   ├── audio_gen.py    # Générateur audio edge-tts
│   └── main.py         # Orchestrateur principal
├── public/
│   ├── index.html      # Interface utilisateur
│   ├── style.css       # Style Cyberpunk
│   ├── data.json       # Données générées
│   └── audio/
│       └── latest_briefing.mp3
├── .github/
│   └── workflows/
│       └── daily_cron.yml
└── requirements.txt
```

## 🚀 Démarrage Rapide

### Prérequis

- Python 3.10+
- Clé API OpenAI

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votrenom/CyberDailyWatch.git
cd CyberDailyWatch

# Installer les dépendances
pip install -r requirements.txt

# Configurer la clé API OpenAI
export OPENAI_API_KEY="votre-cle-api"
```

### Exécution Locale

```bash
cd src
python main.py
```

### Voir le Site Web

```bash
cd public
python -m http.server 8000
# Ouvrir http://localhost:8000
```

## ⚙️ Configuration GitHub Actions

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez un nouveau secret : `OPENAI_API_KEY` avec votre clé API
3. Le workflow s'exécute automatiquement à 08h00 UTC chaque jour

## 🎨 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Scraping | requests, beautifulsoup4 |
| IA | OpenAI GPT-4o-mini |
| Synthèse vocale | edge-tts (fr-FR-HenriNeural) |
| Frontend | HTML5, CSS3 (Vanilla) |
| Automation | GitHub Actions |

## 📝 Licence

Licence MIT - libre d'utilisation et modification !
# ActuCybersecurite
