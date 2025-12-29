(function () {
  const menus = Array.from(document.querySelectorAll('[data-user-menu]'));
  if (!menus.length) return;

  function closeAll() {
    menus.forEach((m) => {
      m.classList.remove('open');
      const btn = m.querySelector('.user-menu-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  menus.forEach((menu) => {
    const btn = menu.querySelector('.user-menu-trigger');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      closeAll();
      if (!isOpen) {
        menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    menu.addEventListener('click', (e) => e.stopPropagation());
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
})();
