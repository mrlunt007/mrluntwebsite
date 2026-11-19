# PrimeSupportCo Website

Professional B2B website for PrimeSupportCo — Managed IT Services, Technology Consulting, and IT Talent Solutions.

## Environment Variables

Create a local env file (for example `.env.local`) with:

```
RESEND_API_KEY="re_xxxxxxxx"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxx"
```

## Install

```
npm install
```

## API Routes (Vercel Functions)

- `api/contact.js` — business inquiry form submissions
- `api/upload-resume.js` — resume uploads to Vercel Blob
- `api/application.js` — career inquiry / application submissions

Routes:

- Accept `POST` requests only
- Use `process.env.RESEND_API_KEY`
- Send emails to `contact@primesupportco.com`
- Use `onboarding@resend.dev` as the sender (update when a verified domain is configured)

## Local Testing

1. Install dependencies: `npm install`
2. Set environment variables in `.env.local`
3. Run with Vercel CLI: `vercel dev`
4. Test pages:
   - `index.html` / `contact.html` inquiry forms
   - `careers-apply.html` career inquiry form

## Site Structure

- `index.html` — homepage
- `managed-it-services.html` — managed IT services
- `it-staffing.html` — IT staffing & recruiting
- `technology-solutions.html` — technology consulting & solutions
- `outsourced-it-support.html` — SEO: outsourced / business IT support
- `microsoft-365-management.html` — SEO: Microsoft 365 management
- `technical-recruiting.html` — SEO: technical recruiting
- `industries.html` — industries
- `about.html` — about
- `careers.html` — careers
- `careers-apply.html` — general career inquiry
- `contact.html` — contact / consultation
- `sitemap.xml` / `robots.txt` — search indexing

Legacy `services.html` and outdated career listing URLs redirect via `vercel.json`.
