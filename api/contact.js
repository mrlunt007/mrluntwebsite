const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const body = await getJsonBody(req);
    const { name, email, company, message } = body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, and message.",
      });
    }

    await resend.emails.send({
      from: "PrimeSupport <onboarding@resend.dev>",
      to: "contact@primesupportco.com",
      reply_to: email,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || "Not provided")}</p>
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
