import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // loadEnv charge depuis les fichiers .env (local)
    const env = loadEnv(mode, '.', '');

    // Sur Netlify, les variables sont en process.env, pas dans des fichiers .env
    // On combine les deux sources
    const getEnvVar = (key: string): string => {
      return process.env[key] || env[key] || '';
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Firebase variables - disponibles depuis process.env sur Netlify
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(getEnvVar('VITE_FIREBASE_API_KEY')),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(getEnvVar('VITE_FIREBASE_AUTH_DOMAIN')),
        'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(getEnvVar('VITE_FIREBASE_DATABASE_URL')),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_PROJECT_ID')),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(getEnvVar('VITE_FIREBASE_STORAGE_BUCKET')),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID')),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_APP_ID')),
        'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')),
        // Gemini variables
        'process.env.API_KEY': JSON.stringify(getEnvVar('VITE_GEMINI_API_KEY')),
        'process.env.GEMINI_API_KEY': JSON.stringify(getEnvVar('VITE_GEMINI_API_KEY'))
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
