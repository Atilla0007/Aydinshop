// Simple realtime chat client (SSE)

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const widgetToggleBtn = document.getElementById('global-chat-toggle');
const widgetContainer = document.getElementById('global-chat-widget');
const widgetCloseBtn = document.getElementById('global-chat-close');
const widgetForm = document.getElementById('global-chat-form');
const widgetInput = document.getElementById('global-chat-input');
const widgetMessagesBox = document.getElementById('global-chat-messages');

const pageChatBox = document.getElementById('chat-box');
const pageChatForm = document.getElementById('chat-form');
const pageChatInput = document.getElementById('chat-input');
const isPageChat = Boolean(pageChatBox || pageChatForm);

const isAuth = document.body.dataset.userAuthenticated === 'true';

let updatesSource = null;
let fallbackTimer = null;
let messagesCache = [];

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderMessages(boxElement, messages) {
    if (!boxElement) return;
    boxElement.innerHTML = '';
    if (!messages.length) {
        boxElement.innerHTML = '<div class="chat-empty">هنوز پیامی وجود ندارد. سلام کنید! 👋</div>';
        return;
    }
    messages.forEach((msg) => {
        const div = document.createElement('div');
        div.className = 'chat-message ' + (msg.is_admin ? 'from-admin' : 'from-user');
        div.innerHTML = `
            <div class="chat-message-meta">
                <span class="chat-sender">${msg.sender}</span>
                <span class="chat-time">${msg.created_at}</span>
            </div>
            <div class="chat-message-text">${escapeHtml(msg.text)}</div>
        `;
        boxElement.appendChild(div);
    });
    boxElement.scrollTop = boxElement.scrollHeight;
}

function renderAllMessages(messages) {
    renderMessages(widgetMessagesBox, messages);
    renderMessages(pageChatBox, messages);
}

function setMessages(messages) {
    messagesCache = Array.isArray(messages) ? [...messages] : [];
    renderAllMessages(messagesCache);
}

function loadMessages() {
    if (!isAuth) return;
    fetch('/chat/messages/')
        .then((res) => res.json())
        .then((data) => {
            if (data.messages) {
                setMessages(data.messages);
            }
        })
        .catch((err) => console.error('خطا در دریافت پیام‌ها:', err));
}

function stopRealtimeUpdates() {
    if (updatesSource) {
        updatesSource.close();
        updatesSource = null;
    }
    if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
    }
}

function startRealtimeUpdates() {
    if (!isAuth) return;
    loadMessages();
    stopRealtimeUpdates();

    if ('EventSource' in window) {
        updatesSource = new EventSource('/chat/stream/');
        updatesSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data || '{}');
                if (data && data.type === 'new_message') loadMessages();
            } catch (e) {
                loadMessages();
            }
        };
        updatesSource.onerror = () => {
            // If SSE fails, fall back to a slower polling to keep chat usable.
            if (updatesSource) {
                updatesSource.close();
                updatesSource = null;
            }
            if (!fallbackTimer) {
                fallbackTimer = setInterval(loadMessages, 10000);
            }
        };
        return;
    }

    // Older browsers fallback
    fallbackTimer = setInterval(loadMessages, 10000);
}

function sendMessage(text, btnElement, inputElement) {
    if (!text) return;
    btnElement.disabled = true;
    btnElement.classList.add('is-loading');
    btnElement.setAttribute('aria-busy', 'true');

    const sendData = new FormData();
    sendData.append('message', text);

    // 1) Send user message fast, so it shows up immediately.
    fetch('/chat/send/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        body: sendData,
    })
        .then(async (res) => {
            let data;
            try {
                data = await res.json();
            } catch (e) {
                throw new Error('invalid_json');
            }
            if (!res.ok || !data || data.status !== 'ok') {
                const errMsg = (data && data.error) || 'ارسال پیام انجام نشد.';
                throw new Error(errMsg);
            }

            loadMessages();
            btnElement.disabled = false;
            btnElement.classList.remove('is-loading');
            btnElement.setAttribute('aria-busy', 'false');
            inputElement.value = '';
            inputElement.focus();

            // 2) Ask bot (slow). Pass message_id to avoid saving the user message twice.
            const botData = new FormData();
            if (data.message_id) botData.append('message_id', data.message_id);
            else botData.append('message', text);

            return fetch('/chat/bot/', {
                method: 'POST',
                headers: { 'X-CSRFToken': csrftoken },
                body: botData,
            });
        })
        .then(async (res) => {
            if (!res) return;
            let data;
            try {
                data = await res.json();
            } catch (e) {
                throw new Error('invalid_json');
            }
            if (!res.ok || !data || data.status !== 'ok') {
                const errMsg = (data && data.error) || 'ارسال پیام انجام نشد.';
                throw new Error(errMsg);
            }
            loadMessages();
            if (data.handoff) {
                showNotification('سؤال شما برای پشتیبان ارسال شد.');
            }
        })
        .catch((err) => {
            console.error(err);
            alert('خطا در ارسال پیام.');
        })
        .finally(() => {
            btnElement.disabled = false;
            btnElement.classList.remove('is-loading');
            btnElement.setAttribute('aria-busy', 'false');
            inputElement && inputElement.focus();
        });
}

function showNotification(msg) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        new Notification('پیام پشتیبانی', { body: msg });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((p) => {
            if (p === 'granted') new Notification('پیام پشتیبانی', { body: msg });
        });
    }
}

function alertAuth() {
    alert('برای استفاده از چت باید وارد حساب شوید.');
    window.location.href = '/login/';
}

if (widgetForm) {
    widgetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!isAuth) return alertAuth();
        const text = (widgetInput.value || '').trim();
        const btn = widgetForm.querySelector('button');
        sendMessage(text, btn, widgetInput);
    });
}

if (pageChatForm) {
    pageChatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!isAuth) return alertAuth();
        const text = (pageChatInput.value || '').trim();
        const btn = pageChatForm.querySelector('button');
        sendMessage(text, btn, pageChatInput);
    });
}

if (widgetToggleBtn) {
    widgetToggleBtn.addEventListener('click', () => {
        if (!isAuth) return alertAuth();
        widgetContainer.classList.remove('hidden');
        widgetToggleBtn.classList.add('hidden');
        widgetToggleBtn.style.display = 'none';
        startRealtimeUpdates();
        widgetInput && widgetInput.focus();
    });
}

if (widgetCloseBtn) {
    widgetCloseBtn.addEventListener('click', () => {
        widgetContainer.classList.add('hidden');
        widgetToggleBtn.classList.remove('hidden');
        widgetToggleBtn.style.display = '';
        if (!isPageChat) stopRealtimeUpdates();
    });
}

// Start realtime updates only when chat is visible/needed.
if (isAuth && isPageChat) {
    startRealtimeUpdates();
}

window.addEventListener('beforeunload', () => {
    stopRealtimeUpdates();
});
