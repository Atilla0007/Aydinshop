(() => {
  const initToggle = (toggle, target, openText, closeText) => {
    if (!toggle || !target) {
      return;
    }

    const updateText = () => {
      const isOpen = target.classList.contains('is-open');
      toggle.textContent = isOpen ? closeText : openText;
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => {
      target.classList.toggle('is-open');
      updateText();
      if (target.classList.contains('is-open')) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    updateText();
  };

  initToggle(
    document.querySelector('[data-home-more-toggle]'),
    document.querySelector('[data-home-more]'),
    'مشاهده ادامه محتوا',
    'بستن ادامه محتوا'
  );

  initToggle(
    document.querySelector('[data-home-products-toggle]'),
    document.querySelector('[data-home-products-extra]'),
    'نمایش محصولات بیشتر',
    'بستن محصولات بیشتر'
  );
})();
