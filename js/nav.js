(function () {
  function closeAllDropdowns(except) {
    document.querySelectorAll(".nav-dropdown[data-open='true']").forEach(function (el) {
      if (el !== except) el.setAttribute("data-open", "false");
    });
  }

  function initDropdowns() {
    document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
      var trigger = dropdown.querySelector(".nav-dropdown__trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        var isOpen = dropdown.getAttribute("data-open") === "true";
        closeAllDropdowns(dropdown);
        dropdown.setAttribute("data-open", isOpen ? "false" : "true");
      });
    });

    document.addEventListener("click", function (e) {
      if (!(e.target instanceof Element)) return;
      if (!e.target.closest(".nav-dropdown")) closeAllDropdowns();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAllDropdowns();
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

  function init() {
    initDropdowns();
    initMobileNav();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
