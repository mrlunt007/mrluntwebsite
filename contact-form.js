(function () {
  function setStatus(el, message, isError) {
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.remove("form-status--success", "form-status--error");
    el.classList.add(isError ? "form-status--error" : "form-status--success");
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
      setStatus(status, "Message sent successfully. We will get back to you soon.", false);
    } catch (err) {
      setStatus(status, err.message || "Something went wrong. Please try again.", true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function init() {
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
