import { FIREBASE_CONFIG } from './rules.js';

// Initialize Firebase with error handling to prevent console errors
let app, db, auth, googleAuthProvider;

try {
    app = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    auth = firebase.auth();
    googleAuthProvider = new firebase.auth.GoogleAuthProvider();
} catch (error) {
    // Fail silently — app will degrade gracefully without Firebase
    console.warn('Firebase initialization deferred or unavailable.');
    db = null;
    auth = null;
    googleAuthProvider = null;
}

export { db, auth, googleAuthProvider };