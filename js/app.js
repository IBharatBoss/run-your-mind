import { loginWithGoogle, logoutUser, getLocalUser, initAuthListener } from './auth.js';
import { loadSettings } from './payment.js';
import { loadContent } from './content.js';
import { initLayout } from './components.js';
import { showToast } from './ui.js';

const OVERLAY_TRANSITION_MS = 220;

// BUGS FIXED: Yeh 4 timers define karna jaruri tha, warna modal open/close strict mode mein crash ho jata hai
let profileCloseTimer = null;
let authModalCloseTimer = null;
let profileDismissListenersBound = false;
let authModalDismissListenersBound = false;

function runApp() {
    initLayout();
    initAuthListener();
    loadSettings();
    loadContent();

    // 1. Page load hote hi Bouncer check karega
    checkPremiumAccess();

    window.addEventListener('auth-updated', () => {
        loadContent();
        if (getLocalUser()) closeAuthModal();
        // 2. Auth update hone par wapas check karega
        checkPremiumAccess();
    });

    window.addEventListener('open-auth-modal', openAuthModal);
    
    // UI initializers
    initSearchPlaceholderEffect();
    bindAuthAndOverlayControls();
    bindFounderOverlayControls();
    
    const formContainer = document.getElementById('form-container');
    if (formContainer) renderAuthForm();
}

// Browser Check: Agar loading ho chuki hai toh turant start karo!
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runApp);
} else {
    runApp();
}

// --- THE ULTIMATE BOUNCER ---
function checkPremiumAccess() {
    const isProtectedPage = window.location.pathname.includes('/mindset/') || 
                            window.location.pathname.includes('/productivity/') || 
                            window.location.pathname.includes('/survival/') || 
                            window.location.pathname.includes('/wealthandskills/');

    // IF NOT PROTECTED (e.g., Policy pages, Index), un-hide content immediately and stop execution.
    if (!isProtectedPage) {
        document.body.classList.add('premium-verified');
        return;
    }

    const user = getLocalUser();

    if (!user || user.membership_status !== 'active') {
        window.location.replace('../index.html'); 
        return;
    }

    document.body.classList.add('premium-verified');
}


function initSearchPlaceholderEffect() {
    const searchInput = document.getElementById('content-search-input');
    if (!searchInput) return;

    const placeholderPhrases = [
        'Search articles...',
        'Find insights...',
        'Explore the library...'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let pauseTicks = 0;

    const typeEffect = () => {
        const activePhrase = placeholderPhrases[phraseIndex];

        if (isDeleting) {
            charIndex = Math.max(charIndex - 1, 0);
        } else {
            charIndex = Math.min(charIndex + 1, activePhrase.length);
        }

        searchInput.setAttribute('placeholder', activePhrase.slice(0, charIndex));

        if (!isDeleting && charIndex === activePhrase.length) {
            pauseTicks += 1;
            if (pauseTicks >= 8) {
                isDeleting = true;
                pauseTicks = 0;
            }
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
        }

        window.setTimeout(typeEffect, 90);
    };

    typeEffect();
}

function bindAuthAndOverlayControls() {
    // EVENT DELEGATION: The Immortal Button Fix
    document.addEventListener('click', async (event) => {
        const target = event.target;

        // Guard clause: Agar target valid HTML element nahi hai (e.g. text node), toh crash hone se bachao
        if (!target || typeof target.closest !== 'function') return;

        // 1. Login/Profile Button Click
        const navAuthBtn = target.closest('#nav-auth-btn');
        if (navAuthBtn) {
            event.preventDefault();
            if (getLocalUser()) {
                toggleProfileMenu();
            } else {
                toggleAuthModal();
            }
            return;
        }

        // 2. Logout Button Click
        const profileLogoutBtn = target.closest('#profile-logout-btn');
        if (profileLogoutBtn) {
            closeProfileMenu();
            await logoutUser();
            return;
        }

        // 3. Close Auth Modal Click
        const closeModalBtn = target.closest('#close-modal-btn');
        if (closeModalBtn) {
            closeAuthModal();
            return;
        }

        // 4. Close Profile Menu Click
        const closeProfileBtn = target.closest('#close-profile-btn');
        if (closeProfileBtn) {
            closeProfileMenu();
            return;
        }

        // 5. Click outside Auth Modal to close it
        if (target.id === 'auth-modal') {
            closeAuthModal();
            return;
        }
    });
}

function bindFounderOverlayControls() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            dismissFounderOverlay();
        }
    });

    const logoContainer = document.getElementById('logo-container');
    if (!logoContainer) return;

    let founderActive = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const showFounder = () => {
        founderActive = true;
        logoContainer.classList.add('logo-active');
        document.body.classList.add('founder-focus');
    };

    const hideFounder = () => {
        founderActive = false;
        logoContainer.classList.remove('logo-active');
        document.body.classList.remove('founder-focus');
    };

    window._dismissFounder = hideFounder;

    if (isTouchDevice) {
        logoContainer.addEventListener('click', (event) => {
            event.stopPropagation();
            if (founderActive) {
                hideFounder();
            } else {
                showFounder();
            }
        });

        document.addEventListener('click', (event) => {
            if (founderActive && !logoContainer.contains(event.target)) {
                hideFounder();
            }
        });
    } else {
        logoContainer.addEventListener('mouseenter', showFounder);
        logoContainer.addEventListener('mouseleave', hideFounder);
    }
}

function dismissFounderOverlay() {
    if (window._dismissFounder) {
        window._dismissFounder();
    }
}

function isOverlayOpen(element) {
    return Boolean(element && element.classList.contains('flex') && !element.classList.contains('hidden'));
}

function animateOverlayOpen(overlay) {
    if (!overlay) return;

    overlay.classList.remove('hidden', 'opacity-0');
    overlay.classList.add('flex', 'opacity-0');

    window.requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
    });
}

function syncBodyScrollLock() {
    const profileMenu = document.getElementById('profile-menu');
    const authModal = document.getElementById('auth-modal');
    const hasOpenOverlay = isOverlayOpen(profileMenu) || isOverlayOpen(authModal);
    document.body.style.overflow = hasOpenOverlay ? 'hidden' : '';
}

function setNavAuthExpanded(isExpanded) {
    const navAuthBtn = document.getElementById('nav-auth-btn');
    if (!navAuthBtn) return;
    navAuthBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
}

function handleProfileOutsideClick(event) {
    const menu = document.getElementById('profile-menu');
    if (!isOverlayOpen(menu)) return;

    const shell = menu.querySelector('.profile-menu-shell');
    const trigger = document.getElementById('nav-auth-btn');
    const target = event.target;

    if (trigger && trigger.contains(target)) return;
    if (shell && shell.contains(target)) return;

    closeProfileMenu();
}

function handleProfileEscape(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeProfileMenu();
}

function attachProfileDismissListeners() {
    if (profileDismissListenersBound) return;

    document.addEventListener('click', handleProfileOutsideClick, true);
    document.addEventListener('keydown', handleProfileEscape);
    profileDismissListenersBound = true;
}

function detachProfileDismissListeners() {
    if (!profileDismissListenersBound) return;

    document.removeEventListener('click', handleProfileOutsideClick, true);
    document.removeEventListener('keydown', handleProfileEscape);
    profileDismissListenersBound = false;
}

function openProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (!menu || isOverlayOpen(menu)) return;

    window.clearTimeout(profileCloseTimer);
    animateOverlayOpen(menu);
    attachProfileDismissListeners();
    setNavAuthExpanded(true);
    syncBodyScrollLock();
}

function closeProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (!menu || menu.classList.contains('hidden')) return false;

    detachProfileDismissListeners();
    menu.classList.add('opacity-0');

    window.clearTimeout(profileCloseTimer);
    profileCloseTimer = window.setTimeout(() => {
        menu.classList.add('hidden');
        menu.classList.remove('flex', 'opacity-0');
        setNavAuthExpanded(false);
        syncBodyScrollLock();
    }, OVERLAY_TRANSITION_MS);

    return true;
}

function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (!menu) return;

    if (isOverlayOpen(menu)) {
        closeProfileMenu();
    } else {
        openProfileMenu();
    }
}

function handleAuthModalEscape(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeAuthModal();
}

function attachAuthModalDismissListeners() {
    if (authModalDismissListenersBound) return;

    document.addEventListener('keydown', handleAuthModalEscape);
    authModalDismissListenersBound = true;
}

function detachAuthModalDismissListeners() {
    if (!authModalDismissListenersBound) return;

    document.removeEventListener('keydown', handleAuthModalEscape);
    authModalDismissListenersBound = false;
}

function openAuthModal() {
    closeProfileMenu();

    const modal = document.getElementById('auth-modal');
    if (!modal || isOverlayOpen(modal)) return;

    window.clearTimeout(authModalCloseTimer);
    animateOverlayOpen(modal);
    attachAuthModalDismissListeners();
    syncBodyScrollLock();
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal || modal.classList.contains('hidden')) return false;

    detachAuthModalDismissListeners();
    modal.classList.add('opacity-0');

    window.clearTimeout(authModalCloseTimer);
    authModalCloseTimer = window.setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'opacity-0');
        syncBodyScrollLock();
    }, OVERLAY_TRANSITION_MS);

    return true;
}

function toggleAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    if (isOverlayOpen(modal)) {
        closeAuthModal();
    } else {
        openAuthModal();
    }
}

function renderAuthForm() {
    const container = document.getElementById('form-container');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const toggleBtn = document.getElementById('toggle-auth-mode-btn');

    if (!container || !title) return;

    if (toggleBtn) {
        toggleBtn.style.display = 'none';
    }

    title.innerText = 'Unlock Lifetime Access.';

    if (subtitle && !subtitle.textContent.trim()) {
        subtitle.innerText = 'Secure premium access with one click.';
    }

    container.innerHTML = `
        <div class="auth-form-stack">
            <p class="auth-intro-copy">Securely authenticate via Google. Your library syncs permanently to your verified email address.</p>
            <button id="google-auth-btn" class="google-auth-btn">
                <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                <span id="google-btn-text">Continue with Google</span>
            </button>
            <p class="auth-note-copy">No passwords | Instant access | Single source of truth</p>
        </div>
    `;

    const googleAuthBtn = document.getElementById('google-auth-btn');
    const googleBtnText = document.getElementById('google-btn-text');

    if (!googleAuthBtn || !googleBtnText) return;

    googleAuthBtn.addEventListener('click', async () => {
        googleAuthBtn.disabled = true;
        googleAuthBtn.classList.add('is-loading');
        googleBtnText.innerText = 'Connecting...';

        try {
            await loginWithGoogle();
        } catch (error) {
            showToast('Unable to connect to Google right now. Please retry.', 'error');
        } finally {
            googleAuthBtn.disabled = false;
            googleAuthBtn.classList.remove('is-loading');
            googleBtnText.innerText = 'Continue with Google';
        }
    });
}