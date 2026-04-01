import { db, auth, googleAuthProvider } from './firebase-setup.js';
import { DB_PATHS, STORAGE_KEYS, APP_CONSTANTS } from './rules.js';
import { handleSignupGoogle, handleRenewal } from './payment.js';
import { showToast } from './ui.js';

let authListenerInitialized = false;
let authStateUnsubscribe = null;
let persistenceConfigured = false;

function dismissAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    modal.classList.add('opacity-0');

    window.setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'opacity-0');
        document.body.style.overflow = '';
    }, 220);
}

function parseLocalUser(rawValue) {
    if (!rawValue) return null;

    try {
        return JSON.parse(rawValue);
    } catch {
        localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
        return null;
    }
}

export function getLocalUser() {
    return parseLocalUser(localStorage.getItem(STORAGE_KEYS.USER_AUTH));
}

function isMembershipActive(userData) {
    return String(userData?.membership_status || '').toLowerCase() === APP_CONSTANTS.STATUS_ACTIVE;
}

function cacheLocalUser(uid, userData) {
    const localData = {
        ...userData,
        uid,
        dbPath: `${DB_PATHS.USERS}/${uid}`,
        role: APP_CONSTANTS.ROLE_USER
    };
    localStorage.setItem(STORAGE_KEYS.USER_AUTH, JSON.stringify(localData));
}

async function ensureLocalPersistence() {
    if (persistenceConfigured) return;
    persistenceConfigured = true;

    if (!auth) {
        console.warn("Auth module unavailable.");
        return;
    }

    if (
        typeof firebase === 'undefined' ||
        !firebase.auth ||
        !firebase.auth.Auth ||
        !firebase.auth.Auth.Persistence
    ) {
        return;
    }

    try {
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (error) {
        console.warn('Unable to enforce LOCAL auth persistence:', error);
    }
}

async function syncLocalAuthFromFirebase(firebaseUser) {
    const loginFlag = sessionStorage.getItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);

    if (!firebaseUser) {
        if (loginFlag === 'active') return;

        localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
        updateAuthUI();
        return;
    }

    if (loginFlag === 'done') {
        sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);
        updateAuthUI();
        return;
    }

    if (!db) return;

    try {
        const snap = await db.ref(`${DB_PATHS.USERS}/${firebaseUser.uid}`).once('value');

        if (snap.exists()) {
            const userData = snap.val();

            if (isMembershipActive(userData)) {
                cacheLocalUser(firebaseUser.uid, userData);
            } else {
                localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
            }
        } else {
            const cachedUser = getLocalUser();
            if (!cachedUser || cachedUser.uid !== firebaseUser.uid) {
                localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
            }
        }
    } catch (error) {
        console.error('Auth state sync error:', error);
    }

    updateAuthUI();
}

export function initAuthListener() {
    if (authListenerInitialized) {
        updateAuthUI();
        return authStateUnsubscribe;
    }

    authListenerInitialized = true;
    ensureLocalPersistence();

    if (!auth) return;

    authStateUnsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        syncLocalAuthFromFirebase(firebaseUser);
    });

    window.addEventListener('auth-updated', updateAuthUI);
    updateAuthUI();
    return authStateUnsubscribe;
}

export function updateAuthUI() {
    const user = getLocalUser();
    const greeting = document.getElementById('user-greeting');
    const authBtn = document.getElementById('nav-auth-btn');
    const premiumBadge = document.getElementById('premium-badge');
    const profileMenuContent = document.getElementById('profile-menu-content');

    if (!authBtn) return;

    if (user) {
        const firstName = (user.name || 'Member').split(' ')[0];
        const fullName = user.name || 'Premium Member';

        if (greeting) {
            greeting.classList.add('hidden');
            greeting.innerHTML = '';
        }

        if (premiumBadge) {
            premiumBadge.classList.add('hidden');
            premiumBadge.classList.remove('flex');
        }

        authBtn.className = 'auth-strip-btn profile-strip-btn';
        authBtn.setAttribute('aria-label', 'Open profile menu');
        authBtn.setAttribute('aria-expanded', 'false');
        authBtn.innerHTML = `
            <span class="profile-strip-user">
                <span class="profile-avatar" aria-hidden="true">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" stroke="currentColor" stroke-width="1.8"/>
                        <path d="M4.5 20.4a7.9 7.9 0 0 1 15 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </span>
                <span class="profile-name">${escapeHtml(firstName)}</span>
            </span>
            <span class="profile-premium">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 8.5 7.8 12l4.2-6 4.2 6L20 8.5 18 18H6L4 8.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Premium
            </span>
        `;

        if (profileMenuContent) {
            profileMenuContent.innerHTML = `
                <p class="profile-label">Signed in as</p>
                <p class="profile-value">${escapeHtml(fullName)}</p>
            `;
        }
    } else {
        authBtn.className = 'auth-strip-btn auth-cta-btn';
        authBtn.removeAttribute('aria-label');
        authBtn.removeAttribute('aria-expanded');
        authBtn.innerHTML = 'LOGIN / SIGNUP';

        if (profileMenuContent) {
            profileMenuContent.innerHTML = '';
        }
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function loginWithGoogle() {
    if (!auth || !db) {
        showToast('System unavailable. Please refresh.', 'error');
        return false;
    }

    try {
        sessionStorage.setItem(STORAGE_KEYS.LOGIN_IN_PROGRESS, 'active');

        const result = await auth.signInWithPopup(googleAuthProvider);
        const firebaseUser = result.user;

        if (!firebaseUser) {
            sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);
            showToast('Unable to identify your Google account. Please try again.', 'error');
            return false;
        }

        const userSnap = await db.ref(`${DB_PATHS.USERS}/${firebaseUser.uid}`).once('value');
        const userData = userSnap.exists() ? userSnap.val() : null;

        if (userData) {
            if (!isMembershipActive(userData)) {
                sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);

                const wantsToRenew = window.confirm('Your premium access has expired. Would you like to renew?');
                if (wantsToRenew) {
                    handleRenewal(firebaseUser.uid, userData);
                    showToast('Renewal checkout opened. Complete payment to restore access.', 'info');
                } else {
                    localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
                    updateAuthUI();
                    showToast('Renewal is required before access is restored.', 'info');
                }

                return false;
            }

            cacheLocalUser(firebaseUser.uid, userData);
            sessionStorage.setItem(STORAGE_KEYS.LOGIN_IN_PROGRESS, 'done');

            updateAuthUI();
            dismissAuthModal();
            showToast(`Welcome back, ${(userData.name || 'Member').split(' ')[0]}!`, 'success');
            window.dispatchEvent(new Event('auth-updated'));
            return true;
        }

        sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);
        handleSignupGoogle(firebaseUser);
        return false;
    } catch (error) {
        sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);

        if (error.code !== 'auth/popup-closed-by-user') {
            console.error('Google Auth Error', error);
            showToast('Login interrupted. Please ensure popups are enabled and try again.', 'error');
        }

        return false;
    }
}

export async function logoutUser() {
    if (!auth) {
        window.dispatchEvent(new Event('auth-updated'));
        return true;
    }
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Sign-out error:', error);
    }

    localStorage.removeItem(STORAGE_KEYS.USER_AUTH);
    sessionStorage.removeItem(STORAGE_KEYS.CACHED_CONTENT);
    sessionStorage.removeItem(STORAGE_KEYS.CONTENT_TIMESTAMP);
    sessionStorage.removeItem(STORAGE_KEYS.CACHED_SETTINGS);
    sessionStorage.removeItem(STORAGE_KEYS.SETTINGS_TIMESTAMP);
    sessionStorage.removeItem(STORAGE_KEYS.LOGIN_IN_PROGRESS);

    updateAuthUI();
    showToast('You have been signed out.', 'info', 2200);
    window.dispatchEvent(new Event('auth-updated'));
}
