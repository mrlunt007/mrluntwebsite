# PrimeSupport Website

## Environment Variables

Create a local env file (for example `.env.local`) with:

RESEND_API_KEY="re_KT8qdCvb_EmRStzZM7nxz7Um5xt4YaTRd"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

## Install

Install dependencies:

`npm install`

## API Routes (Vercel Functions)

- `api/contact.js` - handles contact form submissions
- `api/upload-resume.js` - uploads resume files to Vercel Blob
- `api/application.js` - handles job application submissions

Both routes:

- Accept `POST` requests only
- Use `process.env.RESEND_API_KEY`
- Send emails to `contact@primesupportco.com`
- Use `onboarding@resend.dev` as the sender

Application flow:

1. Frontend uploads resume to `api/upload-resume.js`
2. API stores file in Vercel Blob and returns a public URL
3. Frontend sends application JSON to `api/application.js`
4. Application email includes resume file name and clickable Blob URL

## Local Testing

1. Install dependencies: `npm install`
2. Set environment variables in `.env.local` (see above)
3. Run with Vercel CLI: `vercel dev`
4. Test pages:
   - `index.html` contact form
   - `careers-apply.html` application form

## Vercel Deployment Testing

1. In Vercel project settings, add `RESEND_API_KEY`
2. Add `BLOB_READ_WRITE_TOKEN`
3. Deploy the project
4. Submit both forms on the deployed site
5. For job applications, verify:
   - Resume uploads successfully
   - Email includes a clickable resume URL
6. Confirm emails arrive at `contact@primesupportco.com`
