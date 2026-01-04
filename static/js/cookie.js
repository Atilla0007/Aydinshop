document.addEventListener('DOMContentLoaded', () => {
    const cookieOverlay = document.getElementById('cookie-consent-overlay');
    if (!cookieOverlay) return;

    const storageKey = 'styraCookieConsent';
    const current = localStorage.getItem(storageKey);

    if (!current) {
        setTimeout(() => {
            cookieOverlay.classList.remove('hidden');
        }, 1000);
    }
});

function acceptCookies() {
    localStorage.setItem('styraCookieConsent', 'accepted');
    closeCookieModal();
}

function declineCookies() {
    localStorage.setItem('styraCookieConsent', 'declined');
    closeCookieModal();
}

function closeCookieModal() {
    const cookieOverlay = document.getElementById('cookie-consent-overlay');
    if (!cookieOverlay) return;
    cookieOverlay.classList.add('hidden');
}
