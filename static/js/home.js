(() => {
  const toggle = document.querySelector('[data-home-more-toggle]');
  const sections = document.querySelector('[data-home-more]');

  if (!toggle || !sections) {
    return;
  }

  const updateText = () => {
    const isOpen = sections.classList.contains('is-open');
    toggle.textContent = isOpen ? 'بستن ادامه محتوا' : 'مشاهده ادامه محتوا';
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  toggle.addEventListener('click', () => {
    sections.classList.toggle('is-open');
    updateText();
    if (sections.classList.contains('is-open')) {
      sections.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  updateText();
})();
