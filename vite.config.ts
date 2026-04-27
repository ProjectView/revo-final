import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    // Vite automatically loads VITE_* variables from process.env
    // loadEnv loads from .env files for local development
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'REVO BTP',
            short_name: 'REVO',
            description: 'Plateforme de gestion de chantiers BTP nouvelle génération',
            theme_color: '#064e3b',
            background_color: '#ffffff',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/icon-192-maskable.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
              },
              {
                src: '/icon-512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ],
            screenshots: [
              {
                src: '/screenshot-narrow.png',
                sizes: '540x720',
                type: 'image/png',
                form_factor: 'narrow'
              },
              {
                src: '/screenshot-wide.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide'
              }
            ],
            categories: ['productivity', 'business'],
            shortcuts: [
              {
                name: 'Voir les chantiers',
                short_name: 'Chantiers',
                description: 'Accéder à la liste des chantiers',
                url: '/?view=sites',
                icons: [
                  {
                    src: '/icon-96.png',
                    sizes: '96x96'
                  }
                ]
              },
              {
                name: 'Voir le calendrier',
                short_name: 'Calendrier',
                description: 'Accéder au calendrier de planification',
                url: '/?view=calendar',
                icons: [
                  {
                    src: '/icon-96.png',
                    sizes: '96x96'
                  }
                ]
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        // For Gemini API - fallback to env file or process.env
        'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Group large rarely-changing vendors into their own chunks so
            // browsers cache them across deploys instead of re-downloading
            // the whole app every time we ship a fix.
            manualChunks: {
              'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
              'vendor-react': ['react', 'react-dom'],
              'vendor-leaflet': ['leaflet', 'react-leaflet'],
              'vendor-icons': ['lucide-react'],
            },
          },
        },
      },
    };
});
