(function () {
  function syncDropdownAria(dropdown) {
    var trigger = dropdown.querySelector(".nav-dropdown__trigger");
    if (!trigger) return;
    var open = dropdown.getAttribute("data-open") === "true";
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAllDropdowns(except) {
    document.querySelectorAll(".nav-dropdown").forEach(function (el) {
      if (el === except) return;
      el.setAttribute("data-open", "false");
      syncDropdownAria(el);
    });
  }

  function initDropdowns() {
    document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
      var trigger = dropdown.querySelector(".nav-dropdown__trigger");
      if (!trigger) return;

      if (!trigger.hasAttribute("aria-expanded")) {
        trigger.setAttribute("aria-expanded", "false");
      }
      syncDropdownAria(dropdown);

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var isOpen = dropdown.getAttribute("data-open") === "true";
        closeAllDropdowns(dropdown);
        dropdown.setAttribute("data-open", isOpen ? "false" : "true");
        syncDropdownAria(dropdown);
      });
    });

    document.addEventListener("click", function (e) {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(".nav-dropdown")) closeAllDropdowns();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllDropdowns();
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".nav-toggle");
        if (header && header.classList.contains("is-open")) {
          header.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  function initMobileNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (!header || !toggle) return;

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) closeAllDropdowns();
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initCopyrightYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    initDropdowns();
    initMobileNav();
    initReveal();
    initCopyrightYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
