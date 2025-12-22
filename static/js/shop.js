(() => {
  const SCROLL_KEY = 'styra_scroll_y_before_cart';

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

  const updateMiniCartPreview = (items, total) => {
    const itemsContainer = document.getElementById('mini-cart-items');
    const totalEl = document.getElementById('mini-cart-total');
    if (!itemsContainer || !totalEl) return;

    const safeItems = Array.isArray(items) ? items : [];
    itemsContainer.innerHTML = '';

    if (!safeItems.length) {
      itemsContainer.innerHTML = '<p class="mini-cart-empty">سبد خرید شما خالی است.</p>';
      totalEl.textContent = formatNumber(0);
      return;
    }

    for (const item of safeItems) {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-cart-item';
      wrapper.innerHTML = `
        <div class="mini-cart-item-main">
          <div class="mini-cart-item-name">${escapeHtml(item.name)}</div>
          <div class="mini-cart-item-meta">${formatNumber(item.quantity)} عدد ${formatNumber(item.unit_price)} تومان</div>
        </div>
        <div class="mini-cart-item-side">
          <button type="button" class="mini-cart-remove" data-mini-cart-remove="${escapeHtml(item.id)}" aria-label="حذف از سبد خرید">×</button>
          <div class="mini-cart-item-price">${formatNumber(item.total_price)} تومان</div>
        </div>
      `;
      itemsContainer.appendChild(wrapper);
    }

    totalEl.textContent = formatNumber(total || 0);
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    const card = target && target.closest ? target.closest('[data-product-card]') : null;
    if (!card) return;

    if (target.closest('[data-no-card-nav]')) return;
    if (target.closest('a, button, input, label, select, textarea')) return;

    const href = card.getAttribute('data-href');
    if (!href) return;
    window.location.assign(href);
  });

  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.matches('[data-cart-toggle]')) return;
    if (input.disabled) return;

    const addUrl = input.dataset.addUrl || '';
    const removeUrl = input.dataset.removeUrl || '';
    const productId = input.dataset.productId || '';

    if (input.checked) {
      if (!addUrl) return;
      try {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY || 0));
      } catch {
        // ignore
      }
      window.location.assign(addUrl);
      return;
    }

    if (!removeUrl || !productId) return;

    input.disabled = true;
    try {
      const body = new URLSearchParams();
      body.set('product_id', productId);
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
      if (!response.ok || !data || !Array.isArray(data.items)) throw new Error('bad_response');
      updateMiniCartPreview(data.items, data.total || 0);
    } catch {
      input.checked = true;
    } finally {
      input.disabled = false;
    }
  });
})();
