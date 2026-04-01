# PrimeSupport Website

## Environment Variables

Create a local env file (for example `.env.local`) with:

RESEND_API_KEY="re_KT8qdCvb_EmRStzZM7nxz7Um5xt4YaTRd"

## Install

Install dependencies:

`npm install`

## API Routes (Vercel Functions)

- `api/contact.js` - handles contact form submissions
- `api/application.js` - handles job application submissions

Both routes:

- Accept `POST` requests only
- Use `process.env.RESEND_API_KEY`
- Send emails to `contact@primesupportco.com`
- Use `onboarding@resend.dev` as the sender

## Local Testing

1. Install dependencies: `npm install`
2. Set environment variable in `.env.local` (see above)
3. Run with Vercel CLI: `vercel dev`
4. Test pages:
   - `index.html` contact form
   - `careers-apply.html` application form

## Vercel Deployment Testing

1. In Vercel project settings, add `RESEND_API_KEY`
2. Deploy the project
3. Submit both forms on the deployed site
4. Confirm emails arrive at `contact@primesupportco.com`
