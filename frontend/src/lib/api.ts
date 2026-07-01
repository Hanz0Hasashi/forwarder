export const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://shutup-forwarder-production.up.railway.app';
