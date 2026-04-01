const { put } = require("@vercel/blob");
const formidableLib = require("formidable");
const fs = require("fs/promises");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[upload-resume] Missing BLOB_READ_WRITE_TOKEN");
      return res.status(500).json({
        success: false,
        error: "Blob storage is not configured.",
      });
    }

    console.log("[upload-resume] Starting multipart parse");
    const file = await parseResumeFile(req);

    if (!file) {
      console.log("[upload-resume] No file found in multipart payload");
      return res
        .status(400)
        .json({ success: false, error: "Resume file is required." });
    }

    console.log("[upload-resume] File received", {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (!ALLOWED_MIME_TYPES.has(file.mimetype || "")) {
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Allowed types: PDF, DOC, DOCX.",
      });
    }

    const bytes = await fs.readFile(file.filepath);
    const safeName = (file.originalFilename || "resume")
      .replace(/[^\w.\-]+/g, "_")
      .slice(0, 120);
    const blobPath = `resumes/${Date.now()}-${safeName}`;

    const blob = await put(blobPath, bytes, {
      access: "public",
      contentType: file.mimetype || "application/octet-stream",
    });

    console.log("[upload-resume] Upload successful", {
      fileName: file.originalFilename || safeName,
      blobPath,
      resumeUrl: blob.url,
    });

    console.log("[upload-resume] Returning JSON response", {
      resumeUrl: blob.url,
      fileName: file.originalFilename || safeName,
    });

    return res.status(200).json({
      success: true,
      fileName: file.originalFilename || safeName,
      resumeUrl: blob.url,
    });
  } catch (error) {
    console.error("[upload-resume] Upload failed", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to upload resume." });
  }
};

function parseResumeFile(req) {
  const createForm =
    formidableLib.formidable || formidableLib.default || formidableLib;

  const form = createForm({
    multiples: false,
    maxFiles: 1,
    maxFileSize: 8 * 1024 * 1024,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      const fileField = files.resume;
      if (!fileField) {
        resolve(null);
        return;
      }
      resolve(Array.isArray(fileField) ? fileField[0] : fileField);
    });
  });
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
