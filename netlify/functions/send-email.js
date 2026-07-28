const { Resend } = require('resend');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not configured.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: RESEND_API_KEY is missing. Please trigger a Netlify re-deploy if you recently added it.'
      })
    };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FROM_EMAIL || 'Capitol CoDesign <agency@capitolcodesign.com>';
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'agency@capitolcodesign.com';
  const clientIp = event.headers['client-ip'] || event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown';

  try {
    const data = JSON.parse(event.body || '{}');
    const formType = data.formType || 'quote';

    // 🛡️ ANTI-SPAM DEFENSE LAYER 1
    const spamCheck = isSpamSubmission(data);
    if (spamCheck.spam) {
      console.warn(`[SPAM BLOCKED] Reason: ${spamCheck.reason} | IP: ${clientIp} | Form: ${formType} | Email: ${data.email || 'N/A'}`);
      
      // Return fake 200 OK success so bots think submission succeeded and don't retry or adapt
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Submission received successfully' })
      };
    }

    if (formType === 'quote') {
      const { name, email, company, budget, services = [], details } = data;

      if (!name || !email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and email are required.' })
        };
      }

      const formattedServices = services.length > 0 ? services.join(', ') : 'None specified';

      // 1. Send notification email to team
      const teamEmailResult = await resend.emails.send({
        from: fromEmail,
        to: [notificationEmail],
        subject: `New Quote Request: ${name} ${company ? `(${company})` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #101f33; max-width: 600px; margin: 0 auto; border: 1px solid #e6e3da; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #16283f; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 600;">New Project Quote Request</h2>
            </div>
            <div style="padding: 24px; background-color: #ffffff;">
              <p style="font-size: 16px; margin-top: 0;">You received a new inquiry from the Capitol CoDesign website:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee; width: 140px;">Name:</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Email:</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(email)}" style="color: #ec965a;">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Company:</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(company || 'N/A')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Budget Range:</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(budget || 'Not specified')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Services Needed:</td>
                  <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(formattedServices)}</td>
                </tr>
              </table>

              <h4 style="margin: 20px 0 8px 0; color: #16283f;">Situation &amp; Project Details:</h4>
              <div style="background-color: #f7f3ea; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(details || 'No details provided.')}</div>
            </div>
          </div>
        `
      });

      if (teamEmailResult.error) {
        console.error('Resend team email error:', teamEmailResult.error);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: teamEmailResult.error.message || 'Failed to send notification email via Resend.'
          })
        };
      }

      // 2. Send automated confirmation email to lead
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: 'We received your request — Capitol CoDesign',
          html: `
            <div style="font-family: Arial, sans-serif; color: #101f33; max-width: 600px; margin: 0 auto; border: 1px solid #e6e3da; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #16283f; color: #ffffff; padding: 24px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">Capitol CoDesign</h2>
              </div>
              <div style="padding: 28px; background-color: #ffffff; line-height: 1.6;">
                <h3 style="margin-top: 0; color: #16283f;">Hi ${escapeHtml(name)},</h3>
                <p>Thank you for reaching out to Capitol CoDesign. We’ve received your project inquiry.</p>
                <p>A senior principal will review your details and reply within <strong>one business day</strong>.</p>
              </div>
            </div>
          `
        });
      } catch (confirmErr) {
        console.warn('Auto-confirmation email notice:', confirmErr);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Quote request submitted successfully' })
      };
    } else if (formType === 'newsletter') {
      const { email } = data;
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email address is required.' })
        };
      }

      const newsResult = await resend.emails.send({
        from: fromEmail,
        to: [notificationEmail],
        subject: `New Newsletter Subscriber: ${email}`,
        html: `<p>New newsletter subscriber: <strong>${escapeHtml(email)}</strong></p>`
      });

      if (newsResult.error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: newsResult.error.message || 'Newsletter signup failed.' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Subscribed successfully' })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid form type' })
    };

  } catch (err) {
    console.error('Error handling form submission:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Failed to process email submission.' })
    };
  }
};

function isSpamSubmission(data) {
  // 1. Honeypot check: If honeypot field is filled, it's a bot
  if (data.hpWebsite && String(data.hpWebsite).trim() !== '') {
    return { spam: true, reason: 'Honeypot field filled' };
  }

  // 2. Submission duration check: Form submitted in under 2 seconds (2000ms)
  if (typeof data.duration === 'number' && data.duration < 2000) {
    return { spam: true, reason: `Fast submission duration (${data.duration}ms)` };
  }

  const fullText = [
    data.name || '',
    data.email || '',
    data.company || '',
    data.details || ''
  ].join(' ');

  // 3. Cyrillic / Russian script detector
  if (/[\u0400-\u04FF]/.test(fullText)) {
    return { spam: true, reason: 'Cyrillic script detected' };
  }

  // 4. URL / Link spam checks
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const linksInNameCompany = ((data.name || '') + ' ' + (data.company || '')).match(urlRegex) || [];
  const linksInDetails = (data.details || '').match(urlRegex) || [];

  if (linksInNameCompany.length > 0) {
    return { spam: true, reason: 'URL inside name or company field' };
  }
  if (linksInDetails.length > 2) {
    return { spam: true, reason: 'Excessive URLs in details (more than 2)' };
  }

  // 5. Spam Keyword Blacklist
  const spamKeywords = [
    /\b(casino|pills|crypto|bitcoin|forex|viagra|cialis|gambling|porn|sex|xhamster)\b/i,
    /\b(telegram\.me|t\.me\/|wa\.me\/|whatsapp:|contact us on whatsapp)\b/i,
    /\b(seo services|rank your website|google ranking|backlinks|first page of google|guest post|link building)\b/i,
    /\b(make money|passive income|investment opportunity|financial freedom)\b/i
  ];

  for (const regex of spamKeywords) {
    if (regex.test(fullText)) {
      return { spam: true, reason: `Blacklisted pattern matched: ${regex.source}` };
    }
  }

  return { spam: false };
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
