# VR Vlog inquiry mail

Destination: info@vrvlog.fun. Gmail forwarding to mouri0077@gmail.com was enabled and a Cloudflare verification message was received there on 2026-11-14 JST.

The `notify.vrvlog.fun` Email Routing subdomain is configured. The destination is verified. Preserve the apex Google Workspace MX/SPF/DKIM records. Do not accept Cloudflare's suggestion to replace the apex Google MX records.

The user explicitly approved production creation and receipt testing on 2026-11-14. The Worker is deployed at https://vrvlog-inquiries.vr-vlog-website.workers.dev. The API test receipt 19f34e20-f667-4cf2-b3ff-1f6abdb00258 reached info and the personal Gmail inbox. Reply-To was verified. The apex SPF includes both _spf.google.com and _spf.mx.cloudflare.net; the apex MX remains smtp.google.com.

Prepared files:

- `worker.mjs`: fixed-destination mail API, Reply-To applicant, validation, body size cap, per-IP rate limiter, honeypot and explicit failures. No inquiry database.
- `wrangler.jsonc`: website account only; no paid-plan change.
- `test.mjs`: local delivery stub; `node inquiries/test.mjs` from repository root.
- `form.html`: source template with confirmation, duplicate-click prevention and delivery errors. The deployed endpoint is substituted in `public/contact/index.html`.

Production account: e4be39f50088dd328e8979961d52153b. Dashboard bindings MAIL and CONTACT_LIMITER (namespace 1001, 3 requests / 60 seconds) are configured. The dashboard does not offer a destination restriction field, so MAIL is unrestricted at the binding level; the Worker fixes the sole recipient to info@vrvlog.fun. wrangler.jsonc additionally restricts the destination for future CLI deploys. The current CLI token belongs to a different telemetry account; do not deploy there. The form is linked from the VRChat footer and support page; its privacy description is in section 8 of the existing policy.

End-to-end acceptance: submit Japanese content from the official site, receive at info and forwarded personal mailbox, confirm Reply-To equals the applicant; test invalid fields and delivery failures without claiming success. No secrets in the frontend.

Improved advertising landing page remains a UI proposal in the parent workspace's `outputs/vrchat-ads-ui-v2.html`. Do not publish its provisional tax/slot wording as settled commercial terms.
