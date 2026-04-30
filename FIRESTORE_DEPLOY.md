# Firestore & RTDB Rules — Deploy guide

Ce dossier contient les règles de sécurité Firestore et Realtime Database
versionnées dans le repo. Toute modification passe par une PR (revue + diff
visible) avant d'être déployée en production.

## Fichiers

| Fichier | Rôle |
|---|---|
| `firestore.rules` | Règles Firestore (la base où vivent toutes les données app) |
| `database.rules.json` | Règles Realtime Database (verrouillée, base inutilisée) |
| `firebase.json` | Config Firebase CLI : déclare quels fichiers déployer |
| `.firebaserc` | Pointe vers le projet Firebase `revo-7904e` |

## Pré-requis (one-time setup)

```bash
# 1. Installer la CLI globalement
npm install -g firebase-tools

# 2. Se connecter au compte Google qui owner le projet Firebase
firebase login

# 3. Vérifier qu'on cible le bon projet
firebase use
# doit afficher: Active Project: default (revo-7904e)
```

## Déploiement

### Déployer uniquement les règles Firestore

```bash
firebase deploy --only firestore:rules
```

### Déployer uniquement les règles RTDB

```bash
firebase deploy --only database
```

### Déployer les deux

```bash
firebase deploy --only firestore:rules,database
```

⚠️ **Ne jamais lancer `firebase deploy` tout court** — ça déploierait aussi
les Cloud Functions, Hosting, etc., même si on ne les a pas configurés ici.

## Tester avant de déployer (recommandé)

L'éditeur de règles dans la Console Firebase a un onglet "Espace de test
dédié aux règles" (rules playground). On peut y simuler des opérations
read/write/list avec un user fictif et vérifier qu'elles passent ou échouent
comme prévu.

Tests à exécuter au minimum sur Firestore :

| User | Operation | Path | Expected |
|---|---|---|---|
| Anonymous | get | `/users/foo@bar.com` | ❌ Deny |
| Anonymous | list | `/companies/abc/sites` | ❌ Deny |
| signed-in user (other company) | get | `/companies/abc/sites/xyz` | ❌ Deny |
| signed-in user (own company) | get | `/companies/<own>/sites/xyz` | ✅ Allow |
| signed-in non-admin | update field `role` of `/users/<self>` | | ❌ Deny |
| signed-in non-admin | update field `name` of `/users/<self>` | | ✅ Allow |
| signed-in admin | update `/users/<other-in-own-company>` field `role` | | ✅ Allow |
| signed-in non-admin | create `/invitations/xxx` | | ❌ Deny |
| signed-in admin | create `/invitations/xxx` for own company | | ✅ Allow |

## Rollback

Si une règle déployée casse l'app en prod :

### Option 1 : Console Firebase (le plus rapide, ~30 sec)

1. [console.firebase.google.com](https://console.firebase.google.com) → projet
2. Firestore Database → Rules
3. Sidebar gauche : **Historique des versions**
4. Clique sur la version d'avant l'incident → **Restaurer**

### Option 2 : Git revert + redeploy

```bash
git revert <sha-du-commit-fautif>
git push
# puis
firebase deploy --only firestore:rules
```

## Iterating on rules

Quand on change `firestore.rules` :

1. Modifier le fichier
2. Tester dans l'éditeur de la Console (mode "Tester")
3. Commit + push
4. Code review via PR
5. `firebase deploy --only firestore:rules`
6. Vérifier qu'aucune erreur de permission n'apparaît dans Sentry après le deploy

## Threat model couvert

Cf. commentaires en tête de `firestore.rules` pour la liste complète :
isolation cross-company, blocage de l'escalade de privilège post-signup,
protection des champs subscription/limits, lifecycle des invitations,
verrouillage du `mail/*`.

**Risque résiduel connu** : à la création du doc `users/{email}` lors de
l'acceptation d'une invitation, un attaquant tenant un token d'invitation
peut écrire un `role` différent de celui prévu par l'invitation. À régler
en Phase 3 via une Cloud Function qui ferait l'acceptation atomiquement
côté serveur.
