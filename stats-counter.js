(function () {
  var DURATION_MS = 2000;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatInt(n) {
    return Math.round(n).toLocaleString("en-US");
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function animateValue(el, target, startTime) {
    function frame(now) {
      var t = Math.min(1, (now - startTime) / DURATION_MS);
      var eased = easeOutCubic(t);
      el.textContent = formatInt(target * eased);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatInt(target);
      }
    }
    requestAnimationFrame(frame);
  }

  function setFinalValues(nodes) {
    nodes.forEach(function (el) {
      var target = parseFloat(el.dataset.target);
      if (Number.isNaN(target)) return;
      el.textContent = formatInt(target);
    });
  }

  function init() {
    var root = document.querySelector("[data-stats-root]");
    if (!root) return;

    var nums = root.querySelectorAll("[data-stat-count]");
    if (!nums.length) return;

    var triggered = false;

    function trigger() {
      if (triggered) return;
      triggered = true;
      if (prefersReducedMotion()) {
        setFinalValues(nums);
        return;
      }
      var start = performance.now();
      nums.forEach(function (el) {
        var target = parseFloat(el.dataset.target);
        if (Number.isNaN(target)) return;
        el.textContent = formatInt(0);
        animateValue(el, target, start);
      });
    }

    if (prefersReducedMotion()) {
      setFinalValues(nums);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      trigger();
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.disconnect();
            trigger();
          }
        });
      },
      { threshold: 0.22, rootMargin: "0px 0px -32px 0px" }
    );

    io.observe(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
