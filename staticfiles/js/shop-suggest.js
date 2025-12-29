(() => {
  const input = document.querySelector('input[data-suggest-url]');
  if (!input) return;

  const listId = input.getAttribute('list');
  const listEl = listId ? document.getElementById(listId) : null;
  const url = input.dataset.suggestUrl || '';

  if (!listEl || !url) return;

  let timer = null;
  let controller = null;

  const clearList = () => {
    listEl.innerHTML = '';
  };

  const updateList = (items) => {
    clearList();
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item;
      listEl.appendChild(option);
    });
  };

  const fetchSuggestions = async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      clearList();
      return;
    }

    if (controller) {
      controller.abort();
    }
    controller = new AbortController();

    try {
      const response = await fetch(`${url}?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('bad_response');
      const data = await response.json();
      updateList(data.suggestions || []);
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      clearList();
    }
  };

  input.addEventListener('input', () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fetchSuggestions, 200);
  });
})();
