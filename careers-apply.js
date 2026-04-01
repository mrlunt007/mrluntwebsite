(function () {
  var MAX_RESUME_SIZE_MB = 8;
  var MAX_RESUME_SIZE_BYTES = MAX_RESUME_SIZE_MB * 1024 * 1024;
  var ALLOWED_RESUME_TYPES = {
    "application/pdf": true,
    "application/msword": true,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  };

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

    if (!resumeFile) {
      showStatus(status, "Please select your resume file before submitting.", true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!ALLOWED_RESUME_TYPES[resumeFile.type]) {
      showStatus(status, "Invalid file type. Please upload a PDF, DOC, or DOCX file.", true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (resumeFile.size > MAX_RESUME_SIZE_BYTES) {
      showStatus(status, "Resume is too large. Maximum file size is 8MB.", true);
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

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
      resumeFileName: resumeFile.name,
    };

    var uploadData = new FormData();
    uploadData.append("resume", resumeFile);
    var uploadEndpoint = "/api/upload-resume";
    var applicationEndpoint = "/api/application";

    fetch(uploadEndpoint, {
      method: "POST",
      body: uploadData,
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!res.ok) {
            throw new Error(data.error || "Could not upload your resume.");
          }
          return data;
        });
      })
      .then(function (uploadResult) {
        var resumeUrl = uploadResult && (uploadResult.resumeUrl || uploadResult.url || "");
        if (!resumeUrl) {
          throw new Error("Resume upload did not return a URL.");
        }
        payload.resumeUrl = resumeUrl;
        payload.resumeFileName = uploadResult.fileName || payload.resumeFileName;

        return fetch(applicationEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
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
        showStatus(status, "Application sent successfully. Thank you for applying.", false);
      })
      .catch(function (err) {
        showStatus(status, err.message || "Something went wrong. Please try again.", true);
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  }

  function showStatus(statusEl, message, isError) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.remove("form-status--success", "form-status--error");
    statusEl.classList.add(isError ? "form-status--error" : "form-status--success");
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
