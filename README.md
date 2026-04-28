# Revo — Gestion de chantiers BTP

Application web de gestion de chantiers, clients, prospects, plannings et prestations pour les entreprises du BTP.

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite
- **UI** : Tailwind CSS, Lucide icons
- **Cartographie** : Leaflet / react-leaflet
- **Backend & données** : Firebase (Auth, Firestore, Storage)
- **PWA** : vite-plugin-pwa
- **Hébergement** : Netlify

## Prérequis

- Node.js 18+
- Un projet Firebase configuré (Auth + Firestore + Storage)

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env.local` et renseigner les valeurs :

```bash
cp .env.example .env.local
```

Variables requises :

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Clé API Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification Firebase |
| `VITE_FIREBASE_DATABASE_URL` | URL de la base Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket Firebase Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID de l'expéditeur de messages |
| `VITE_FIREBASE_APP_ID` | ID de l'application Firebase |
| `VITE_FIREBASE_MEASUREMENT_ID` | ID Analytics Firebase |

Le fichier `.env.local` est ignoré par Git — ne jamais committer de secrets.

## Scripts

```bash
npm run dev       # Serveur de développement (http://localhost:3000)
npm run build     # Build de production dans dist/
npm run preview   # Preview du build de production
```

## Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet (GitHub + Netlify).

## Structure du projet

```
App.tsx              Point d'entrée de l'application
components/          Composants UI (vues, modales, formulaires)
context/             Contextes React (auth, données, …)
hooks/               Hooks personnalisés
lib/                 Configuration Firebase et utilitaires
public/              Assets statiques et manifest PWA
types.ts             Définitions TypeScript globales
constants.tsx        Constantes globales
```
