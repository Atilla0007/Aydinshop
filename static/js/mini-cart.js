(() => {
  const drawer = document.getElementById('mini-cart-drawer');
  const overlay = document.getElementById('mini-cart-overlay');
  const closeButton = document.getElementById('mini-cart-close');
  const itemsContainer = document.getElementById('mini-cart-items');
  const totalEl = document.getElementById('mini-cart-total');
  const alertEl = document.getElementById('mini-cart-alert');

  if (!drawer || !overlay || !closeButton || !itemsContainer || !totalEl) {
    return;
  }

  const SCROLL_KEY = 'styra_scroll_y_before_cart';

  const previewUrl = drawer.dataset.previewUrl;
  const removeUrl = drawer.dataset.removeUrl;

  const escapeHtml = (text) =>
    String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const formatNumber = (value) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value ?? '');
    try {
      return numberValue.toLocaleString('fa-IR').replaceAll('٬', '،').replaceAll(',', '،');
    } catch {
      return String(numberValue);
    }
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const setEmpty = (message) => {
    itemsContainer.innerHTML = `<p class="mini-cart-empty">${escapeHtml(message)}</p>`;
  };

  const setAlert = (messages) => {
    if (!alertEl) return;
    if (!messages || !messages.length) {
      alertEl.textContent = '';
      alertEl.classList.remove('show');
      return;
    }
    alertEl.textContent = `محصولات ناموجود از سبد حذف شدند: ${messages.join(', ')}`;
    alertEl.classList.add('show');
  };

  const renderItems = (items) => {
    itemsContainer.innerHTML = '';
    if (!items.length) {
      setEmpty('سبد خرید شما خالی است.');
      return;
    }

    for (const item of items) {
      const unavailable = item.is_available === false;
      const removed = item.removed === true;
      const wrapper = document.createElement('div');
      wrapper.className = `mini-cart-item${unavailable ? ' unavailable' : ''}`;
      wrapper.innerHTML = `
        <div class="mini-cart-item-main">
          <div class="mini-cart-item-name">${escapeHtml(item.name)}</div>
          ${unavailable ? `<div class="mini-cart-item-status">${removed ? 'ناموجود - از سبد حذف شد' : 'ناموجود'}</div>` : ''}
          <div class="mini-cart-item-meta">${formatNumber(item.quantity)} × ${formatNumber(item.unit_price)} تومان</div>
        </div>
        <div class="mini-cart-item-side">
          <button type="button" class="mini-cart-remove" data-mini-cart-remove="${escapeHtml(item.id)}" aria-label="حذف از سبد خرید">×</button>
          <div class="mini-cart-item-price">${formatNumber(item.total_price)} تومان</div>
        </div>
      `;
      itemsContainer.appendChild(wrapper);
    }
  };

  const loadPreview = async () => {
    if (!previewUrl) return;

    setEmpty('در حال بارگذاری...');
    setAlert([]);
    try {
      const response = await fetch(previewUrl, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('bad_response');
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      renderItems(items);
      totalEl.textContent = formatNumber(data.total || 0);
      setAlert(Array.isArray(data.removed_unavailable) ? data.removed_unavailable : []);
    } catch {
      setEmpty('خطا در دریافت سبد خرید. لطفاً دوباره تلاش کنید.');
      totalEl.textContent = formatNumber(0);
      setAlert([]);
    }
  };

  const openDrawer = async () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('mini-cart-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
    await loadPreview();
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('mini-cart-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
  };

  // Keep scroll position when adding to cart (opening drawer after redirect).
  document.addEventListener(
    'click',
    (event) => {
      const link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (!href.includes('add-to-cart')) return;
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
      } catch {
        // ignore
      }
    },
    true,
  );

  const removeItem = async (productId) => {
    if (!removeUrl || !productId) return;
    try {
      const body = new URLSearchParams();
      body.set('product_id', String(productId));
      const response = await fetch(removeUrl, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        credentials: 'same-origin',
        body: body.toString(),
      });
      const data = await response.json().catch(() => null);
      if (!data || !data.items) throw new Error('invalid_response');
      renderItems(Array.isArray(data.items) ? data.items : []);
      totalEl.textContent = formatNumber(data.total || 0);
      setAlert(Array.isArray(data.removed_unavailable) ? data.removed_unavailable : []);
    } catch {
      setEmpty('خطا در حذف آیتم. لطفاً دوباره تلاش کنید.');
      setAlert([]);
    }
  };

  itemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const btn = target && target.closest ? target.closest('[data-mini-cart-remove]') : null;
    if (!btn) return;
    const id = btn.getAttribute('data-mini-cart-remove');
    if (!id) return;
    removeItem(id);
  });

  overlay.addEventListener('click', closeDrawer);
  closeButton.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  const url = new URL(window.location.href);
  if (url.searchParams.get('cart_open') === '1') {
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved != null) {
        const y = Number(saved);
        if (Number.isFinite(y)) window.scrollTo(0, y);
        sessionStorage.removeItem(SCROLL_KEY);
      }
    } catch {
      // ignore
    }
    openDrawer();
    url.searchParams.delete('cart_open');
    window.history.replaceState({}, '', url.toString());
  }
})();
