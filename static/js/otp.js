(function () {
  const inputs = Array.from(document.querySelectorAll('.otp-form .inputs input'));
  if (!inputs.length) return;

  function focusNext(currentIndex) {
    const next = inputs[currentIndex + 1];
    if (next) next.focus();
  }

  function focusPrev(currentIndex) {
    const prev = inputs[currentIndex - 1];
    if (prev) prev.focus();
  }

  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const v = (e.target.value || '').replace(/\D/g, '');
      e.target.value = v.slice(-1);
      if (e.target.value) focusNext(index);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.currentTarget.value) {
        focusPrev(index);
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      const digits = (text || '').replace(/\D/g, '').slice(0, 4).split('');
      digits.forEach((d, i) => {
        if (inputs[i]) inputs[i].value = d;
      });
      const nextIndex = Math.min(digits.length, inputs.length - 1);
      inputs[nextIndex].focus();
    });
  });

  inputs[0].focus();
})();
