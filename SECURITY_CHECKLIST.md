# Checklist Sécurité - REVO

## Avant de Commiter sur GitHub

- [ ] Vérifier que `.env.local` est dans `.gitignore`
- [ ] Vérifier que aucun fichier `.env*` n'est commité
- [ ] Exécuter : `git status` et confirmer que .env n'apparaît pas
- [ ] Exécuter : `git check-ignore .env.local` (devrait retourner `.env.local`)

## Avant de Déployer sur Netlify

- [ ] Toutes les variables d'environnement sont ajoutées dans Netlify
- [ ] Les noms des variables correspondent exactement (même casse)
- [ ] Firebase rules sont configurées pour sécuriser la base de données
- [ ] Les API Keys Firebase sont restreintes par domaine
- [ ] Gemini API Key est restreinte par domaine (Google Cloud Console)

## Configuration Firebase Recommandée

### 1. Restreindre les API Keys

Dans Firebase Console → Project Settings → API Keys :
- Clique sur la clé Web API
- Restreins à "Browser applications"
- Ajoute tes domaines (localhost, netlify.app, etc.)

### 2. Configurer les Rules Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Exemple : permettre la lecture seulement aux utilisateurs connectés
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Configurer les Rules Realtime Database

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 4. Restreindre les Clés Gemini API

Dans Google Cloud Console :
1. Va à "APIs & Services" → "Credentials"
2. Clique sur ta clé API
3. Ajoute les domaines autorisés
4. Limite les API autorisées à "Google Generative AI API"

## Audit Sécurité Régulier

Chaque mois, vérifie :

- [ ] Qu'aucune clé ne s'est glissée dans le code source
- [ ] Que les domaines restreints sur les API Keys sont à jour
- [ ] Que seuls les secrets nécessaires sont exposés
- [ ] Que les collaborateurs GitHub ont l'accès approprié
- [ ] Que les logs Netlify ne montrent pas de variables exposées

### Commande de vérification :

```bash
# Chercher les patterns de secrets
git log -p -S "VITE_FIREBASE" -- "*.ts" "*.tsx" | head -20

# Chercher les hardcoded API keys
grep -r "AIzaSy\|sk_live_\|ghp_" . --include="*.ts" --include="*.tsx" --include="*.js"
```

## En Cas d'Exposition

Si une clé est accidentellement exposée :

1. **IMMÉDIATEMENT** : Va à la console (Firebase/Google Cloud)
2. Désactiver/Régénérer la clé exposée
3. Créer une nouvelle clé
4. Mettre à jour les GitHub Secrets
5. Mettre à jour les Netlify Env Vars
6. Nettoyer l'historique Git si nécessaire
7. Envoyer un message aux utilisateurs affectés

## Ressources

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Firebase - Security Best Practices](https://firebase.google.com/docs/projects/best-practices)
- [Google Cloud - API Key Security](https://cloud.google.com/docs/authentication/api-keys)
