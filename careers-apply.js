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
    if (status) {
      status.hidden = false;
      status.textContent =
        "Your answers were not sent—wire this form to your server or email endpoint to accept applications.";
    }
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
