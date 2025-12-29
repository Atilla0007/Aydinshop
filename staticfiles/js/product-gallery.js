(() => {
  const initGallery = (gallery) => {
    const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
    const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
    const prevBtn = gallery.querySelector("[data-gallery-prev]");
    const nextBtn = gallery.querySelector("[data-gallery-next]");

    if (!slides.length) return;

    let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (activeIndex < 0) activeIndex = 0;

    const setActive = (index) => {
      const nextIndex = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const isActive = i === nextIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle("is-active", i === nextIndex);
      });
      activeIndex = nextIndex;
    };

    const gotoPrev = () => setActive(activeIndex - 1);
    const gotoNext = () => setActive(activeIndex + 1);

    setActive(activeIndex);

    if (slides.length <= 1) {
      gallery.classList.add("is-single");
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.addEventListener("click", gotoPrev);
    if (nextBtn) nextBtn.addEventListener("click", gotoNext);

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => setActive(i));
    });

    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        gotoPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        gotoNext();
      }
    });
  };

  const onReady = () => {
    document.querySelectorAll("[data-product-gallery]").forEach(initGallery);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
