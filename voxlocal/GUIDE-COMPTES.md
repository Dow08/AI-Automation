# Guide pas-à-pas — ouvrir les comptes (tâche #6)

> Objectif : récupérer les clés API pour brancher le vocal réel. **Tout a un palier gratuit** — aucun euro engagé pour tester. On y va par niveaux : d'abord juste « entendre l'IA décrocher », puis brancher notre stack, puis un vrai client.

⚠️ **Sécurité** : chaque clé se colle dans un fichier `.env` (copié depuis `.env.example`). Ce fichier est **déjà ignoré par git** — ne le commite JAMAIS, ne le partage à personne.

```powershell
# Dans voxlocal/voxlocal/ :
Copy-Item .env.example .env   # puis remplis .env avec les clés ci-dessous
```

---

## NIVEAU 1 — Entendre l'IA décrocher (~15 min, gratuit)

### 1. Vapi (orchestrateur vocal) — LE plus important
- Va sur **vapi.ai** → *Sign up* (Google/email).
- Tu reçois des **crédits gratuits** pour tester.
- Dans le dashboard : section **API Keys** → copie la clé.
- Colle-la dans `.env` : `VAPI_API_KEY=...`
- Bonus : Vapi permet d'**acheter/obtenir un numéro de test** et de créer un assistant directement dans son interface → tu peux déjà l'appeler et l'entendre, même avant notre code.

### 2. Google AI Studio (Gemini) — le modèle, gratuit
- Va sur **aistudio.google.com** → connecte ton compte Google.
- Clique **Get API key** → *Create API key*.
- Colle dans `.env` : `GEMINI_API_KEY=...`
- Le palier gratuit de Gemini Flash suffit largement pour démarrer.

➡️ Avec ces deux-là, on peut configurer un agent et **l'appeler pour l'entendre répondre**.

---

## NIVEAU 2 — Brancher notre stack (qualité + contrôle)

### 3. Anthropic (Claude) — raisonnement critique
- Va sur **console.anthropic.com** → *Sign up*.
- Section **API Keys** → *Create Key* → colle dans `.env` : `ANTHROPIC_API_KEY=...`
- Note : peut demander d'ajouter une carte ; il y a souvent un petit crédit offert. Usage faible au début (Claude réservé aux tâches critiques via le model-router).

### 4. (Optionnel ici) Supabase — base de données
- **supabase.com** → *New project* (gratuit). Récupère `Project URL` et la clé.
- `.env` : `SUPABASE_URL=...` et `SUPABASE_KEY=...`
- Pas indispensable pour les premiers tests (on a déjà des backends locaux SQLite).

---

## NIVEAU 3 — Pour un VRAI client (numéro FR + facturation)

### 5. Twilio — numéro de téléphone
- **twilio.com** → *Sign up* (essai gratuit ~15 $ de crédit).
- Dashboard → copie **Account SID** et **Auth Token** → `.env` :
  `TWILIO_ACCOUNT_SID=...` / `TWILIO_AUTH_TOKEN=...`
- ⚠️ **Numéro français** : il faut un *Regulatory Bundle* (extrait **KBIS** + pièce d'identité du représentant). → nécessite ton **entité juridique**.
- Pour juste tester, un numéro d'essai (souvent US/UK) suffit ; le numéro FR vient quand tu as un client.

### 6. Entité juridique (micro-entreprise)
- **autoentrepreneur.urssaf.fr** → déclaration de début d'activité (gratuit). Tu obtiens un **SIRET**.
- Nécessaire pour : le numéro FR, signer le DPA/CGV, facturer. (Pas requis pour les tests du niveau 1.)

### 7. Stripe — encaissement (plus tard)
- **stripe.com** → compte → clés API. Pour la facturation réelle (le mcp-billing local suffit en attendant).

---

## Récapitulatif des clés à mettre dans `.env`
| Variable | Service | Niveau |
| :-- | :-- | :-: |
| `VAPI_API_KEY` | Vapi | 1 |
| `GEMINI_API_KEY` | Google AI Studio | 1 |
| `ANTHROPIC_API_KEY` | Anthropic | 2 |
| `SUPABASE_URL` / `SUPABASE_KEY` | Supabase | 2 (option) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio | 3 |

## Quand tu as fait le Niveau 1
Dis-moi « **niveau 1 ok** » (ou colle-moi un message quand les clés sont dans `.env`) et je construis **mcp-telephony** + je branche notre agent BTP sur Vapi pour le premier vrai test vocal.
