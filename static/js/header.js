document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  if (!header) return;

  const toggle = header.querySelector(".header__menu-toggle");
  const dropdownTriggers = header.querySelectorAll("[data-dropdown]");

  const isMobile = () => window.matchMedia("(max-width: 960px)").matches;

  const closeDropdowns = () => {
    header.querySelectorAll(".nav__item.is-open").forEach((item) => {
      item.classList.remove("is-open");
    });
  };

  const closeMenu = () => {
    header.classList.remove("is-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
    closeDropdowns();
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (!isOpen) {
        closeDropdowns();
      }
    });
  }

  dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!isMobile()) return;
      event.preventDefault();
      const item = trigger.closest(".nav__item");
      if (!item) return;
      const alreadyOpen = item.classList.contains("is-open");
      closeDropdowns();
      if (!alreadyOpen) {
        item.classList.add("is-open");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
      return;
    }

    if (isMobile()) return;
    const target = event.target;
    const isDropdown = target && target.closest && target.closest(".nav__item--dropdown");
    if (!isDropdown) {
      closeDropdowns();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      closeMenu();
    }
  });
});
