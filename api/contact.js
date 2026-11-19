const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED_SERVICES = new Set([
  "Managed IT Services",
  "IT Staffing & Recruiting",
  "Technology Consulting",
  "General Inquiry",
]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const body = await getJsonBody(req);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const company = String(body.company || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();
    const honeypot = String(body.website || body.company_website || "").trim();

    // Spam bots often fill hidden fields.
    if (honeypot) {
      return res.status(200).json({ success: true });
    }

    if (!name || !email || !company || !service || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, company, service, and message.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid business email address.",
      });
    }

    if (!ALLOWED_SERVICES.has(service)) {
      return res.status(400).json({
        success: false,
        error: "Please select a valid service of interest.",
      });
    }

    if (name.length > 120 || company.length > 160 || message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: "One or more fields exceed the allowed length.",
      });
    }

    await resend.emails.send({
      from: "PrimeSupportCo <onboarding@resend.dev>",
      to: "contact@primesupportco.com",
      reply_to: email,
      subject: `New Business Inquiry — ${service}`,
      html: `
        <h2>New Business Inquiry</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p><strong>Service of interest:</strong> ${escapeHtml(service)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to send contact email.",
    });
  }
};

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function getJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const raw = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
