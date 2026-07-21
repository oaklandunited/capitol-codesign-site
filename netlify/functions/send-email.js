const { Resend } = require('resend');

exports.handler = async (event, context) => {
  // Always allow CORS for POST preflight and JSON response
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
        error: 'Server configuration error: RESEND_API_KEY environment variable is missing.'
      })
    };
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FROM_EMAIL || 'Capitol CoDesign <onboarding@resend.dev>';
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'agency@capitolcodesign.com';

  try {
    const data = JSON.parse(event.body || '{}');
    const formType = data.formType || 'quote';

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

      // 1. Send notification email to Capitol CoDesign team
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
            <div style="background-color: #f7f3ea; padding: 12px 20px; font-size: 13px; color: #55637a; text-align: center;">
              Submitted on ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST
            </div>
          </div>
        `
      });

      // 2. Send automated confirmation email to the lead
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: 'We received your request — Capitol CoDesign',
          html: `
            <div style="font-family: Arial, sans-serif; color: #101f33; max-width: 600px; margin: 0 auto; border: 1px solid #e6e3da; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #16283f; color: #ffffff; padding: 24px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">Capitol CoDesign</h2>
                <p style="margin: 6px 0 0 0; color: #f1b98c; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Design. Develop. Deploy.</p>
              </div>
              <div style="padding: 28px; background-color: #ffffff; line-height: 1.6;">
                <h3 style="margin-top: 0; color: #16283f;">Hi ${escapeHtml(name)},</h3>
                <p>Thank you for reaching out to Capitol CoDesign. We’ve received your project inquiry.</p>
                <p>A senior principal will review your details and reply within <strong>one business day</strong> with either a straight answer, a fixed-scope proposal, or an honest referral if we’re not the best fit.</p>
                <div style="background-color: #f7f3ea; border-left: 4px solid #ec965a; padding: 16px; margin: 20px 0; border-radius: 0 6px 6px 0;">
                  <strong style="color: #a45213;">What happens next:</strong>
                  <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>No automated sales sequences or pushy callbacks.</li>
                    <li>Direct line to the principal who builds your technology.</li>
                  </ul>
                </div>
                <p>If you have any urgent questions in the meantime, feel free to call us directly at <a href="tel:9166168102" style="color: #a45213; font-weight: bold;">916-616-8102</a>.</p>
                <p style="margin-bottom: 0;">Best regards,<br><strong>The Capitol CoDesign Team</strong><br><span style="color: #55637a; font-size: 13px;">Sacramento, CA</span></p>
              </div>
            </div>
          `
        });
      } catch (confirmErr) {
        console.warn('Auto-confirmation email to lead failed (likely unverified sender/recipient domain on trial):', confirmErr);
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

      await resend.emails.send({
        from: fromEmail,
        to: [notificationEmail],
        subject: `New Newsletter Subscriber: ${email}`,
        html: `<p>New newsletter subscriber: <strong>${escapeHtml(email)}</strong></p>`
      });

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
      body: JSON.stringify({ error: 'Failed to process email submission.' })
    };
  }
};

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
