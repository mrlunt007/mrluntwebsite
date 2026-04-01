(function () {
  "use strict";

  var root = document.getElementById("home-testimonials");
  if (!root) return;

  var viewport = root.querySelector(".testimonial-carousel__viewport");
  var track = root.querySelector("[data-carousel-track]");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");
  var dotsWrap = root.querySelector("[data-carousel-dots]");
  if (!viewport || !track || !prevBtn || !nextBtn || !dotsWrap) return;

  var slides = Array.prototype.slice.call(
    root.querySelectorAll(".testimonial-carousel__slide")
  );
  var dots = Array.prototype.slice.call(
    dotsWrap.querySelectorAll("[data-carousel-dot]")
  );
  var n = slides.length;
  if (n === 0) return;

  var index = 0;
  var timer = null;
  var resizeRaf = null;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var narrowMq = window.matchMedia("(max-width: 600px)");

  function intervalMs() {
    if (prefersReducedMotion) return 0;
    return narrowMq.matches ? 7000 : 5500;
  }

  /** Width available for one slide inside the viewport (excludes horizontal padding on the viewport). */
  function slideWidthPx() {
    var style = window.getComputedStyle(viewport);
    var pl = parseFloat(style.paddingLeft) || 0;
    var pr = parseFloat(style.paddingRight) || 0;
    var inner = viewport.clientWidth - pl - pr;
    return Math.max(0, Math.round(inner * 1000) / 1000);
  }

  function relayout() {
    var w = slideWidthPx();
    if (w <= 0) return;

    slides.forEach(function (slide) {
      slide.style.flex = "0 0 " + w + "px";
      slide.style.width = w + "px";
      slide.style.minWidth = w + "px";
      slide.style.maxWidth = w + "px";
    });
    track.style.width = w * n + "px";
    applyTransform();
  }

  function scheduleRelayout() {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(function () {
      resizeRaf = null;
      relayout();
    });
  }

  function applyTransform() {
    var w = slideWidthPx();
    if (w <= 0) return;
    var x = -index * w;
    track.style.transform = "translate3d(" + x + "px, 0, 0)";
  }

  function updateUi() {
    applyTransform();
    slides.forEach(function (slide, j) {
      var active = j === index;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, j) {
      var active = j === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
      dot.setAttribute("tabindex", active ? "0" : "-1");
    });
    root.setAttribute(
      "aria-label",
      "Client testimonials, slide " + (index + 1) + " of " + n
    );
  }

  function goTo(i) {
    index = ((i % n) + n) % n;
    updateUi();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion) return;
    var ms = intervalMs();
    if (ms <= 0) return;
    timer = setInterval(next, ms);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener("click", function (e) {
    e.preventDefault();
    prev();
    restartAutoplay();
  });

  nextBtn.addEventListener("click", function (e) {
    e.preventDefault();
    next();
    restartAutoplay();
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function (e) {
      e.preventDefault();
      var i = parseInt(dot.getAttribute("data-carousel-dot"), 10);
      if (!isNaN(i)) {
        goTo(i);
        restartAutoplay();
      }
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);

  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", function () {
    window.requestAnimationFrame(function () {
      if (!root.contains(document.activeElement)) {
        startAutoplay();
      }
    });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  function onNarrowChange() {
    scheduleRelayout();
    restartAutoplay();
  }
  if (narrowMq.addEventListener) {
    narrowMq.addEventListener("change", onNarrowChange);
  } else if (narrowMq.addListener) {
    narrowMq.addListener(onNarrowChange);
  }

  window.addEventListener("resize", scheduleRelayout);

  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      scheduleRelayout();
    });
    ro.observe(viewport);
  }

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      restartAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      restartAutoplay();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
      restartAutoplay();
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(n - 1);
      restartAutoplay();
    }
  });

  function boot() {
    relayout();
    goTo(0);
    startAutoplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(boot);
      });
    });
  } else {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(boot);
    });
  }
})();
