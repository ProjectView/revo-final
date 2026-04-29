# Deployment Guide - GitHub & Netlify

## Security Setup

This project uses environment variables to securely store sensitive credentials (Firebase keys, API keys, etc.). Never commit these values to version control.

### Environment Variables Configuration

1. **Local Development (.env.local)**
   - Copy `.env.example` to `.env.local` (this file is already created for you)
   - Fill in the values with your actual credentials
   - `.env.local` is ignored by Git and will never be committed

2. **Available Variables**
   - `VITE_FIREBASE_API_KEY` - Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
   - `VITE_FIREBASE_DATABASE_URL` - Firebase database URL
   - `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
   - `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
   - `VITE_FIREBASE_APP_ID` - Firebase app ID
   - `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

## Deploy to GitHub

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - secure configuration"
   ```

2. Create a new repository on GitHub (https://github.com/new)

3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Deploy to Netlify

### Step 1: Connect GitHub to Netlify

1. Go to [Netlify](https://netlify.com) and sign in with GitHub
2. Click "New site from Git"
3. Select your GitHub repository
4. Choose main branch for production deploys

### Step 2: Configure Environment Variables

**IMPORTANT:** Before deploying, add your environment variables to Netlify:

1. Go to your site on Netlify
2. Navigate to **Site Settings** → **Build & deploy** → **Environment**
3. Click **Edit variables** under "Environment variables"
4. Add each variable from your `.env.local`:
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: (your Firebase API key)
   - Repeat for all Firebase variables

5. For production and preview environments, make sure all variables are set

### Step 3: Configure Build Settings

Netlify should auto-detect your settings, but verify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18+ (recommended)

### Step 4: Deploy

1. Once environment variables are added, trigger a new deploy
2. Netlify will now build successfully with your credentials loaded from environment variables

## Troubleshooting

### Build fails with "Secrets scanning found secrets"

This means Netlify detected hardcoded secrets. To fix:

1. Verify all environment variables are set in Netlify site settings
2. Verify the code uses `import.meta.env.VITE_*` variables (not hardcoded values)
3. Trigger a new deploy after variables are set

### Variables not loading locally

Make sure:
1. Your `.env.local` file exists in the project root
2. File naming is correct (not `.env.local.txt` or other variations)
3. Restart your development server: `npm run dev`

### Firebase connection issues

Verify that:
1. All Firebase variables are correctly set in `.env.local` (locally) and Netlify settings (production)
2. Firebase rules allow your app's domain
3. No typos in variable names

## Security Best Practices

- ✅ Never commit `.env.local` or any `.env` file with real credentials
- ✅ Always use environment variables for secrets
- ✅ Verify `.gitignore` includes `.env*` files
- ✅ Use `.env.example` to document required variables
- ✅ Set environment variables securely in Netlify (not as code)
- ✅ Rotate Firebase keys if accidentally exposed

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/learn-more)
