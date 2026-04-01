const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const body = await getJsonBody(req);

    const role = body.role || body.position || "";
    const fullName = body.fullName || body.full_name || body.name || "";
    const email = body.email || "";
    const phone = body.phone || "";
    const location = body.location || "";
    const linkedinOrPortfolio =
      body.linkedinOrPortfolio || body.linkedin_or_portfolio || "";
    const coverLetter = body.coverLetter || body.cover_letter || body.message || "";
    const resumeFileName = body.resumeFileName || "";
    const resumeUrl = body.resumeUrl || "";

    if (!role || !fullName || !email || !phone || !location || !coverLetter) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: role, fullName/name, email, phone, location, and coverLetter/message.",
      });
    }

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: resumeUrl.",
      });
    }

    await resend.emails.send({
      from: "PrimeSupport Careers <onboarding@resend.dev>",
      to: "contact@primesupportco.com",
      reply_to: email,
      subject: `New Job Application: ${role}`,
      html: `
        <h2>New Job Application</h2>
        <p><strong>Role:</strong> ${escapeHtml(role)}</p>
        <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Location:</strong> ${escapeHtml(location)}</p>
        <p><strong>LinkedIn / Portfolio:</strong> ${escapeHtml(linkedinOrPortfolio || "Not provided")}</p>
        <p><strong>Resume File Name:</strong> ${escapeHtml(resumeFileName || "Not provided")}</p>
        <p><strong>Resume URL:</strong> ${
          resumeUrl
            ? `<a href="${escapeHtml(resumeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resumeUrl)}</a>`
            : "Not provided"
        }</p>
        <p><strong>Cover Letter:</strong></p>
        <p>${escapeHtml(coverLetter).replace(/\n/g, "<br/>")}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to send application email.",
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
