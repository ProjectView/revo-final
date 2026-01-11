# Guide de Déploiement Sécurisé - REVO

## 1. Configuration Locale

Avant de commencer, assure-toi que tu as un fichier `.env.local` configuré (il n'est PAS commité sur Git) :

```bash
# .env.local (NE PAS COMMITER)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
# ... autres clés
```

Utilise `.env.example` comme template.

## 2. Configuration GitHub

### Étape 1 : Créer un dépôt GitHub

```bash
git init
git add .
git commit -m "Initial commit: REVO project with secure env setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/revo.git
git push -u origin main
```

### Étape 2 : Configurer les GitHub Secrets

1. Va à ton dépôt GitHub
2. Settings → Secrets and variables → Actions
3. Clique sur "New repository secret"
4. Ajoute ces secrets (copie les valeurs depuis `.env.local`) :

| Secret Name | Value |
|-------------|-------|
| `VITE_FIREBASE_API_KEY` | Copie depuis .env.local |
| `VITE_FIREBASE_AUTH_DOMAIN` | Copie depuis .env.local |
| `VITE_FIREBASE_DATABASE_URL` | Copie depuis .env.local |
| `VITE_FIREBASE_PROJECT_ID` | Copie depuis .env.local |
| `VITE_FIREBASE_STORAGE_BUCKET` | Copie depuis .env.local |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Copie depuis .env.local |
| `VITE_FIREBASE_APP_ID` | Copie depuis .env.local |
| `VITE_FIREBASE_MEASUREMENT_ID` | Copie depuis .env.local |
| `VITE_GEMINI_API_KEY` | Ta vraie clé Gemini |

## 3. Configuration Netlify

### Étape 1 : Connecter GitHub à Netlify

1. Va sur [Netlify](https://netlify.com)
2. Clique "Add new site" → "Import an existing project"
3. Sélectionne "GitHub" et authorize Netlify
4. Cherche et sélectionne ton dépôt "revo"

### Étape 2 : Configurer les Variables d'Environnement

1. Dans Netlify, va à Site settings → Build & deploy → Environment
2. Clique "Edit variables"
3. Ajoute toutes les mêmes clés (utilise les mêmes noms que les GitHub Secrets)

### Étape 3 : Configuration de Build

Le build devrait être automatiquement détecté :
- **Build command** : `npm run build`
- **Publish directory** : `dist`

Si ce n'est pas correct, va à Site settings → Build & deploy → Build settings et modifie.

### Étape 4 : Redéployer

1. Va à "Deploys"
2. Clique "Trigger deploy" → "Deploy site"
3. Attends que le build se termine

## 4. Sécurité - Bonnes Pratiques

### ✅ À faire :
- ✓ Utiliser `.env.local` en local (jamais commiter)
- ✓ Utiliser GitHub Secrets pour CI/CD
- ✓ Utiliser Netlify Env Vars pour production
- ✓ Limiter l'accès à tes secrets (GitHub collaborators)
- ✓ Régulièrement vérifier si des secrets n'ont pas été commités

### ❌ À NE PAS faire :
- ✗ Ne JAMAIS commiter `.env` ou `.env.local`
- ✗ Ne JAMAIS partager tes clés API en public
- ✗ Ne JAMAIS hardcoder les secrets dans le code
- ✗ Ne JAMAIS inclure `.env` dans `.gitignore` sauf si tu le supprimes d'abord

## 5. Vérifier la Sécurité

### Vérifier que `.env` n'est pas commité :

```bash
git log --all --full-history -- .env
git log --all --full-history -- .env.local
# Devrait retourner "fatal: your filter-branch" ou rien
```

Si c'est commité, voir la section "Nettoyer l'historique Git" ci-dessous.

### Nettoyer l'historique Git (si secrets commités)

⚠️ **ATTENTION** : Cela réécrit l'historique Git. À faire seulement si nécessaire.

```bash
# Installer git-filter-repo (meilleur que git filter-branch)
pip install git-filter-repo

# Supprimer .env de tout l'historique
git filter-repo --invert-paths --path .env.local

# Forcer le push (attention : destructif)
git push origin main --force-with-lease
```

## 6. Ajouter un Workflow GitHub Actions (optionnel)

Crée `.github/workflows/deploy.yml` pour automatiser :

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: nwtour/action-netlify@v2.0
        with:
          publish-dir: './dist'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 7. Troubleshooting

### Build échoue sur Netlify avec "undefined" env vars
- Assure-toi que toutes les variables sont ajoutées dans Netlify env
- Redéploie avec "Trigger deploy"

### Erreur "Firebase initialization failed"
- Vérifie que `VITE_FIREBASE_PROJECT_ID` est correct
- Vérifie que les clés correspondent au bon projet Firebase

### Page blanche au chargement
- Ouvre la console (F12)
- Cherche des erreurs liées à les variables d'environnement
- Vérifie que le build est complet dans Netlify

## 8. Liens Utiles

- [Netlify - Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [GitHub - Creating Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vite - Env Variables](https://vitejs.dev/guide/env-and-modes.html)
- [Firebase - API Keys](https://firebase.google.com/docs/projects/api/project-settings)
