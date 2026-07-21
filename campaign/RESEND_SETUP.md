# Resend Email Integration Setup

The quote request form (`#quoteForm`) and newsletter signup (`#newsForm`) on the Capitol CoDesign website are now wired to use **Resend** via a Netlify Serverless Function (`/api/send-email`).

---

## ⚙️ How It Works

1. **User Submits Form**: The client-side JavaScript sends a `POST` request to `/api/send-email` (rewritten via `_redirects` to `/.netlify/functions/send-email`).
2. **Netlify Serverless Function**:
   - Sends an immediate **notification email** to `agency@capitolcodesign.com` detailing the client's name, company, budget range, selected services, and situation details.
   - Sends an automated **branded confirmation email** to the client's email address reassuring them that a senior principal will reply within 1 business day.
3. **Frontend Feedback**: The form dynamically renders a confirmation card with no page reload.

---

## 🔑 Netlify Configuration (1-Minute Setup)

To enable email delivery in production:

1. Log into your **[Netlify Dashboard](https://app.netlify.com)**.
2. Navigate to **Site Settings** ➔ **Environment Variables**.
3. Add the following environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_123456789...` *(Your API key from [resend.com](https://resend.com/api-keys))*

*(Optional)* Additional environment variables:
- `NOTIFICATION_EMAIL`: Email address to receive notifications (Defaults to `agency@capitolcodesign.com`).
- `FROM_EMAIL`: Verified sender address (Defaults to `Capitol CoDesign <onboarding@resend.dev>` for testing; update to `Capitol CoDesign <agency@capitolcodesign.com>` once your domain DNS is verified in Resend).

---

## 🛠️ Files Added / Modified

- `netlify/functions/send-email.js`: Netlify Function handler using Resend Node.js SDK.
- `package.json`: Contains `"resend"` dependency for Netlify build step.
- `_redirects`: Added `/api/send-email /.netlify/functions/send-email 200` endpoint rewrite.
- `index.html`: Asynchronous `fetch('/api/send-email')` submission handler with loading states and error notifications.
