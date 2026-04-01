import { db } from './firebase-setup.js';
import { DB_PATHS, APP_CONSTANTS, STORAGE_KEYS, CACHE_TTL } from './rules.js';
import { showToast } from './ui.js';

export let dynamicSettings = { price: 0, key: '' };

// Lazy-load Razorpay checkout script on demand (saves ~150KB+ on initial load)
let razorpayLoaded = false;
function loadRazorpaySDK() {
    if (razorpayLoaded || window.Razorpay) {
        razorpayLoaded = true;
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => { razorpayLoaded = true; resolve(); };
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.head.appendChild(script);
    });
}

export async function loadSettings() {
    const cachedSettings = sessionStorage.getItem(STORAGE_KEYS.CACHED_SETTINGS);
    const cachedTimestamp = sessionStorage.getItem(STORAGE_KEYS.SETTINGS_TIMESTAMP);

    if (cachedSettings && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < CACHE_TTL.SETTINGS) {
            const data = JSON.parse(cachedSettings);
            applySettings(data);
            return;
        }
    }

    try {
        const snapshot = await db.ref(DB_PATHS.SETTINGS).once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            sessionStorage.setItem(STORAGE_KEYS.CACHED_SETTINGS, JSON.stringify(data));
            sessionStorage.setItem(STORAGE_KEYS.SETTINGS_TIMESTAMP, String(Date.now()));
            applySettings(data);
        }
    } catch (error) {
        console.error('Settings load error:', error);
        if (cachedSettings) {
            applySettings(JSON.parse(cachedSettings));
        }
    }
}

function applySettings(data) {
    dynamicSettings.price = Number(data.current_price || 0);
    dynamicSettings.key = data.razorpay_key_id || '';

    if (data.maintenance_mode) {
        showMaintenanceOverlay();
        return;
    }

    if (data.announcement_text) {
        const bar = document.getElementById('announcement-bar');
        if (bar) {
            bar.innerText = data.announcement_text;
            bar.classList.remove('hidden');
        }
    }

    const subtitle = document.getElementById('modal-subtitle');
    if (subtitle) {
        subtitle.innerText = `One-time payment of INR ${dynamicSettings.price} for lifetime access.`;
    }
}

function showMaintenanceOverlay() {
    if (document.getElementById('maintenance-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: var(--paper, #FAF9F6);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; padding: 2rem;
    `;
    overlay.innerHTML = `
        <h1 style="font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem); font-style: italic; color: var(--ink, #101014); margin-bottom: 1rem;">Under Maintenance</h1>
        <p style="font-family: 'Manrope', sans-serif; color: var(--ink-muted, #6b7074); font-size: 1.1rem; max-width: 400px; line-height: 1.6;">We're making things better. Please check back in a few minutes.</p>
    `;
    document.body.appendChild(overlay);
}

export async function handleSignupGoogle(firebaseUser) {
    if (!dynamicSettings.key && dynamicSettings.price > 0) {
        showToast('Syncing with server. Please wait a moment and retry.', 'info');
        return;
    }

    const name = firebaseUser.displayName || 'New User';
    const email = firebaseUser.email;
    const phone = firebaseUser.phoneNumber || '';

    if (dynamicSettings.price === 0) {
        const freeTxnId = `txn_free_${Date.now()}`;
        saveNewUserGoogle(firebaseUser.uid, name, email, phone, freeTxnId);
        return;
    }

    // Lazy-load Razorpay SDK only when needed
    try {
        await loadRazorpaySDK();
    } catch {
        showToast('Unable to load payment gateway. Please refresh and retry.', 'error');
        return;
    }

    const options = {
        key: dynamicSettings.key,
        amount: dynamicSettings.price * 100,
        currency: 'INR',
        name: 'RUN YOUR MIND',
        description: 'Lifetime Premium Access',
        handler(response) {
            saveNewUserGoogle(firebaseUser.uid, name, email, phone, response.razorpay_payment_id);
        },
        modal: {
            ondismiss() {
                showToast('Payment was cancelled. You can retry anytime.', 'info');
            }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#1D1D1F' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
        showToast('Payment failed. Please retry.', 'error');
    });
    rzp.open();
}

async function saveNewUserGoogle(uid, name, email, phone, paymentId) {
    const today = new Date().toISOString().split('T')[0];

    const userData = {
        name,
        email: String(email || '').toLowerCase(),
        phone_number: phone,
        joined_date: today,
        membership_status: APP_CONSTANTS.STATUS_ACTIVE
    };

    try {
        await db.ref(`${DB_PATHS.USERS}/${uid}`).set(userData);
        await db.ref(`${DB_PATHS.TRANSACTIONS}/txn_${paymentId}`).set({
            user_id: uid,
            amount: dynamicSettings.price,
            razorpay_payment_id: paymentId,
            status: 'success',
            date: today
        });

        const localData = {
            ...userData,
            uid,
            dbPath: `${DB_PATHS.USERS}/${uid}`,
            role: APP_CONSTANTS.ROLE_USER
        };
        localStorage.setItem(STORAGE_KEYS.USER_AUTH, JSON.stringify(localData));

        showToast('Welcome to Premium!', 'success');
        window.dispatchEvent(new Event('auth-updated'));
    } catch (error) {
        console.error('Signup save error:', error);
        showToast('Database error. Please contact support.', 'error');
    }
}

function readCachedUser() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_AUTH) || '{}');
    } catch {
        return {};
    }
}

export async function handleRenewal(userId, userData) {
    if (!dynamicSettings.key && dynamicSettings.price > 0) {
        showToast('Syncing with server. Please wait a moment and retry.', 'info');
        return;
    }

    if (dynamicSettings.price === 0) {
        processFreeRenewal(userId, userData);
        return;
    }

    // Lazy-load Razorpay SDK only when needed
    try {
        await loadRazorpaySDK();
    } catch {
        showToast('Unable to load payment gateway. Please refresh and retry.', 'error');
        return;
    }

    const options = {
        key: dynamicSettings.key,
        amount: dynamicSettings.price * 100,
        currency: 'INR',
        name: 'RUN YOUR MIND',
        description: 'Premium Account Renewal',
        async handler(response) {
            try {
                await db.ref(`${DB_PATHS.USERS}/${userId}`).update({
                    membership_status: APP_CONSTANTS.STATUS_ACTIVE
                });

                const today = new Date().toISOString().split('T')[0];
                await db.ref(`${DB_PATHS.TRANSACTIONS}/txn_${response.razorpay_payment_id}`).set({
                    user_id: userId,
                    amount: dynamicSettings.price,
                    razorpay_payment_id: response.razorpay_payment_id,
                    status: 'success',
                    date: today,
                    type: 'renewal'
                });

                const existing = readCachedUser();
                const refreshedLocalData = {
                    ...existing,
                    ...userData,
                    uid: userId,
                    membership_status: APP_CONSTANTS.STATUS_ACTIVE,
                    dbPath: `${DB_PATHS.USERS}/${userId}`,
                    role: APP_CONSTANTS.ROLE_USER
                };
                localStorage.setItem(STORAGE_KEYS.USER_AUTH, JSON.stringify(refreshedLocalData));

                showToast('Account renewed successfully. Library access restored.', 'success');
                window.dispatchEvent(new Event('auth-updated'));
            } catch (error) {
                console.error('Renewal update error:', error);
                showToast('Error updating account. Please contact support.', 'error');
            }
        },
        modal: {
            ondismiss() {
                showToast('Renewal checkout was closed before completion.', 'info');
            }
        },
        prefill: {
            name: userData.name,
            email: userData.email,
            contact: userData.phone_number
        },
        theme: { color: '#1D1D1F' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => {
        showToast('Renewal failed. Please retry.', 'error');
    });
    rzp.open();
}

async function processFreeRenewal(userId, userData) {
    try {
        await db.ref(`${DB_PATHS.USERS}/${userId}`).update({
            membership_status: APP_CONSTANTS.STATUS_ACTIVE
        });

        const today = new Date().toISOString().split('T')[0];
        const fakePaymentId = `txn_free_renew_${Date.now()}`;
        await db.ref(`${DB_PATHS.TRANSACTIONS}/${fakePaymentId}`).set({
            user_id: userId,
            amount: 0,
            razorpay_payment_id: fakePaymentId,
            status: 'success',
            date: today,
            type: 'renewal'
        });

        const existing = readCachedUser();
        const refreshedLocalData = {
            ...existing,
            ...userData,
            uid: userId,
            membership_status: APP_CONSTANTS.STATUS_ACTIVE,
            dbPath: `${DB_PATHS.USERS}/${userId}`,
            role: APP_CONSTANTS.ROLE_USER
        };
        localStorage.setItem(STORAGE_KEYS.USER_AUTH, JSON.stringify(refreshedLocalData));

        showToast('Account renewed successfully.', 'success');
        window.dispatchEvent(new Event('auth-updated'));
    } catch (error) {
        console.error('Free renewal error:', error);
        showToast('Error updating account. Please contact support.', 'error');
    }
}
