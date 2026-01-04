const STORAGE_KEY = 'styraCookieConsent';

const getStorageValue = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        return null;
    }
};

const setStorageValue = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        // ignore storage errors (private mode, etc.)
    }
};

const closeCookieModal = () => {
    const cookieOverlay = document.getElementById('cookie-consent-overlay');
    if (!cookieOverlay) return;
    cookieOverlay.classList.add('hidden');
};

const acceptCookies = () => {
    setStorageValue(STORAGE_KEY, 'accepted');
    closeCookieModal();
};

const declineCookies = () => {
    setStorageValue(STORAGE_KEY, 'declined');
    closeCookieModal();
};

window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;

document.addEventListener('DOMContentLoaded', () => {
    const cookieOverlay = document.getElementById('cookie-consent-overlay');
    if (!cookieOverlay) return;

    const current = getStorageValue(STORAGE_KEY);
    if (!current) {
        setTimeout(() => {
            cookieOverlay.classList.remove('hidden');
        }, 1000);
    }

    cookieOverlay.querySelector('.acceptButton')?.addEventListener('click', acceptCookies);
    cookieOverlay.querySelector('.declineButton')?.addEventListener('click', declineCookies);
});
