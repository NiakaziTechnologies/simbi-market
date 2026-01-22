// Environment variables configuration for client-side access
// This script will be populated by Next.js with actual environment variables
(function(window) {
  window.__env = window.__env || {};

  // These will be replaced by Next.js at build time
  window.__env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyB164AO9UUl8tI-QwOMMdKWY59hieEsXV8';
  window.__env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'carspian-seller.firebaseapp.com';
  window.__env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'carspian-seller';
  window.__env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'carspian-seller.firebasestorage.app';
  window.__env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '1050585468515';
  window.__env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:1050585468515:web:2e77b528d763c098fd7256';

  console.log('Environment variables loaded into window.__env:', {
    apiKey: window.__env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'present' : 'missing',
    authDomain: window.__env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'present' : 'missing',
    projectId: window.__env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'present' : 'missing',
    appId: window.__env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'present' : 'missing'
  });
})(typeof window !== 'undefined' ? window : {});