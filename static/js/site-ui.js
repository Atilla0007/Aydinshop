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
