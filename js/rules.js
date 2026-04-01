// js/rules.js

// 1. FIREBASE CONFIGURATION
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDQM0shdIERgL1MBl-ilcdX1ahVu47QWNM",
    authDomain: "run-your-mind.firebaseapp.com",
    databaseURL: "https://run-your-mind-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "run-your-mind",
    storageBucket: "run-your-mind.firebasestorage.app",
    messagingSenderId: "882023826423",
    appId: "1:882023826423:web:4f9f3a2cf5a96fe85864f2"
};

// 2. DATABASE PATHS (Strict Folder Names)
export const DB_PATHS = {
    SETTINGS: "settings",
    USERS: "users",
    CONTENT: "content",
    CONTENT_META: "content_meta",
    CONTENT_URLS: "content_urls",
    TRANSACTIONS: "transactions"
};

// 3. STORAGE KEYS (For Browser Memory)
export const STORAGE_KEYS = {
    USER_AUTH: "rym_user_auth",              // localStorage: Keeps user logged in
    CACHED_CONTENT: "rym_cached_meta",       // sessionStorage: Caches content_meta list
    CACHED_SETTINGS: "rym_cached_settings",  // sessionStorage: Caches settings (price, key, announcement)
    SETTINGS_TIMESTAMP: "rym_settings_ts",   // sessionStorage: When settings were last fetched
    CONTENT_TIMESTAMP: "rym_content_ts",     // sessionStorage: When content was last fetched
    LOGIN_IN_PROGRESS: "rym_login_active"    // sessionStorage: Flag to prevent double reads during login
};

// 4. ROLES & STATUS
export const APP_CONSTANTS = {
    ROLE_USER: "user",
    STATUS_ACTIVE: "active",
    STATUS_INACTIVE: "inactive"
};

// 5. CACHE DURATIONS (milliseconds)
export const CACHE_TTL = {
    SETTINGS: 10 * 60 * 1000,     // 10 minutes
    CONTENT: 15 * 60 * 1000       // 15 minutes
};