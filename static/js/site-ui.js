(() => {
  const scrollBtn = document.getElementById('scroll-top-btn');
  if (!scrollBtn) {
    return;
  }

  const threshold = () => Math.max(window.innerHeight || 0, 360);

  const onScroll = () => {
    if (window.scrollY > threshold()) {
      scrollBtn.classList.add('is-visible');
    } else {
      scrollBtn.classList.remove('is-visible');
    }
  };

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

(() => {
  const cards = document.querySelectorAll('[data-href]');
  if (!cards.length) {
    return;
  }
  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.closest && target.closest('a, button')) {
        return;
      }
      const url = card.getAttribute('data-href');
      if (url) {
        window.location.href = url;
      }
    });
  });
})();
