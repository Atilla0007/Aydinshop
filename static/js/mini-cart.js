(() => {
  const drawer = document.getElementById('mini-cart-drawer');
  const overlay = document.getElementById('mini-cart-overlay');
  const closeButton = document.getElementById('mini-cart-close');
  const itemsContainer = document.getElementById('mini-cart-items');
  const totalEl = document.getElementById('mini-cart-total');

  if (!drawer || !overlay || !closeButton || !itemsContainer || !totalEl) {
    return;
  }

  const previewUrl = drawer.dataset.previewUrl;

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
      return numberValue.toLocaleString('fa-IR');
    } catch {
      return String(numberValue);
    }
  };

  const setEmpty = (message) => {
    itemsContainer.innerHTML = `<p class="mini-cart-empty">${escapeHtml(message)}</p>`;
  };

  const renderItems = (items) => {
    itemsContainer.innerHTML = '';
    if (!items.length) {
      setEmpty('سبد خرید شما خالی است.');
      return;
    }

    for (const item of items) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-cart-item';
      wrapper.innerHTML = `
        <div class="mini-cart-item-main">
          <div class="mini-cart-item-name">${escapeHtml(item.name)}</div>
          <div class="mini-cart-item-meta">${formatNumber(item.quantity)} × ${formatNumber(item.unit_price)} تومان</div>
        </div>
        <div class="mini-cart-item-price">${formatNumber(item.total_price)} تومان</div>
      `;
      itemsContainer.appendChild(wrapper);
    }
  };

  const loadPreview = async () => {
    if (!previewUrl) return;

    setEmpty('در حال بارگذاری...');
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
    } catch {
      setEmpty('خطا در دریافت سبد خرید. لطفاً دوباره تلاش کنید.');
      totalEl.textContent = formatNumber(0);
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

  overlay.addEventListener('click', closeDrawer);
  closeButton.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  const url = new URL(window.location.href);
  if (url.searchParams.get('cart_open') === '1') {
    openDrawer();
    url.searchParams.delete('cart_open');
    window.history.replaceState({}, '', url.toString());
  }
})();

