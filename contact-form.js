(function () {
  function setStatus(el, message, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.remove("form-status--success", "form-status--error");
    el.classList.add(isError ? "form-status--error" : "form-status--success");
  }

  function prefillServiceFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");
    if (!service) return;
    var select = document.getElementById("contact-service");
    if (!select) return;

    var options = Array.prototype.slice.call(select.options);
    var match = options.find(function (opt) {
      return opt.value === service;
    });
    if (match) select.value = service;
  }

  async function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    var status = document.getElementById("contact-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    var payload = {
      name: form.elements.name ? form.elements.name.value.trim() : "",
      email: form.elements.email ? form.elements.email.value.trim() : "",
      company: form.elements.company ? form.elements.company.value.trim() : "",
      service: form.elements.service ? form.elements.service.value.trim() : "",
      message: form.elements.message ? form.elements.message.value.trim() : "",
    };

    try {
      var res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      var data = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) {
        throw new Error(data.error || "Could not send your message right now.");
      }

      form.reset();
      setStatus(status, "Inquiry sent successfully. We will follow up soon.", false);
    } catch (err) {
      setStatus(status, err.message || "Something went wrong. Please try again.", true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function init() {
    prefillServiceFromQuery();
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", onSubmit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
