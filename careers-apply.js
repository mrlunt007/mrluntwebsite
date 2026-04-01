(function () {
  var PARAM_TO_VALUE = {
    "technical-support-specialist": "technical-support-specialist",
    sdr: "sales-development-representative",
    "sales-development-representative": "sales-development-representative",
    general: "general-application",
    "general-application": "general-application",
  };

  function preselectRole() {
    var select = document.getElementById("apply-position");
    if (!select) return;

    var params = new URLSearchParams(window.location.search);
    var raw = (params.get("role") || "").trim().toLowerCase();
    var value = PARAM_TO_VALUE[raw];
    if (!value) return;

    var opt = select.querySelector('option[value="' + value + '"]');
    if (opt) {
      select.value = value;
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    var status = document.getElementById("apply-status");

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    var resumeInput = document.getElementById("apply-resume");
    var resumeFile = resumeInput && resumeInput.files && resumeInput.files[0] ? resumeInput.files[0] : null;

    var payload = {
      role: form.elements.position ? form.elements.position.value : "",
      fullName: form.elements.full_name ? form.elements.full_name.value.trim() : "",
      email: form.elements.email ? form.elements.email.value.trim() : "",
      phone: form.elements.phone ? form.elements.phone.value.trim() : "",
      location: form.elements.location ? form.elements.location.value.trim() : "",
      linkedinOrPortfolio: form.elements.linkedin_or_portfolio
        ? form.elements.linkedin_or_portfolio.value.trim()
        : "",
      coverLetter: form.elements.cover_letter ? form.elements.cover_letter.value.trim() : "",
      resumeFileName: resumeFile ? resumeFile.name : "",
    };

    fetch("/api/application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!res.ok) {
            throw new Error(data.error || "Could not send your application.");
          }
          return data;
        });
      })
      .then(function () {
        form.reset();
        if (status) {
          status.hidden = false;
          status.textContent = "Application sent successfully. Thank you for applying.";
          status.classList.remove("form-status--error");
          status.classList.add("form-status--success");
        }
      })
      .catch(function (err) {
        if (status) {
          status.hidden = false;
          status.textContent = err.message || "Something went wrong. Please try again.";
          status.classList.remove("form-status--success");
          status.classList.add("form-status--error");
        }
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function init() {
    preselectRole();
    var form = document.getElementById("careers-apply-form");
    if (form) {
      form.addEventListener("submit", onSubmit);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
