// Environment configuration

// API
export const API_CONFIG = {
  // Use environment variables if available (baked in at build time)
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',
  WEB_SERVICES_URL: process.env.REACT_APP_WEB_SERVICES_URL || 'http://localhost:8082/api',
  IMAGE_SERVICE_URL: process.env.REACT_APP_IMAGE_SERVICE_URL || 'http://localhost:8083/api',
  TIMEOUT: 30000 // 30 seconds
};

// Firebase 
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDT3yRvJzSRgM_pDn_sDW-n47kdBPR7_Ng",
  authDomain: "userapp-db271.firebaseapp.com",
  projectId: "userapp-db271",
  storageBucket: "userapp-db271.appspot.com",
  messagingSenderId: "829397928616",
  appId: "1:829397928616:web:0da65c1b324d78b6a0109d",
  measurementId: "G-M4SBX0225C"
};

// Application settings
export const APP_CONFIG = {
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_PAGINATION_LIMIT: 10,
  DEFAULT_SORT_FIELD: 'date',
  DEFAULT_SORT_ORDER: 'asc'
};

// Export default configuration
export default {
  API: API_CONFIG,
  FIREBASE: FIREBASE_CONFIG,
  APP: APP_CONFIG
};