/**
 * Capitol CoDesign - AI Project Brief Serverless Function
 * Netlify Modern Functions API (Streaming SSE)
 *
 * Route: POST /api/project-brief
 */

import { Resend } from 'resend';
import crypto from 'node:crypto';

// In-memory rate limiting map: ipHash -> Array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Service catalog grounded strictly in Capitol CoDesign's real offerings
const CAPITOL_SERVICE_CATALOG = `
- Web Design & Development: Hand-coded, sub-second HTML/CSS/ESNext builds, zero-plugin bloat, WCAG 2.1 AA compliant, 100% client code ownership.
- AI Strategy & Readiness Audit: Process mapping, workflow scoring for AI leverage, ranked implementation roadmaps with cost/payback estimates.
- Custom AI Agents: Tailored assistant engines for customer intake, scheduling, lead qualification, and staff workflows trained on verified business data.
- Workflow Automation: Multi-tool integrations (HubSpot, Salesforce, Resend, Zapier, Google Workspace, custom webhooks) that eliminate manual data entry.
- AEO & Answer-Engine Visibility: Structuring content with JSON-LD schema and entity blocks so ChatGPT, Claude, and Perplexity accurately cite your business.
- Team Training & Enablement: Hands-on staff training to run and maintain workflows with no long-term vendor lock-in.
`;

const SYSTEM_PROMPT = `You are the lead engineering principal at Capitol CoDesign, a Sacramento digital agency specializing in custom high-performance web development and practical AI workflow automation.

Your job is to transform a prospective client's business challenge into a clear, realistic, and highly practical AI Project Brief.

Voice and style guidelines:
- Plainspoken, pragmatic, and direct. No corporate buzzwords or AI hype.
- Recommend ONLY services Capitol CoDesign actually provides.
- Sacramento identity and nationwide delivery.
- DO NOT invent pricing, specific dollar amounts, or binding timelines. Emphasize that a fixed-scope proposal follows a 45-minute discovery audit.
- DO NOT promise guaranteed rankings, regulatory compliance, or arbitrary ROI numbers.
- Keep the brief focused, readable, and structured into the exact 7 sections below.

Format the output strictly in clean Markdown using these seven numbered sections:
# Project Brief: [Business Name or Project Name]

## 1. Project Summary
[Concise summary of their business context, key problem statement, and primary desired outcome.]

## 2. Objectives & Proposed Success Measures
[2-4 concrete, realistic objectives. Proposed metrics must be clearly labeled as targets/estimates, not guarantees.]

## 3. Recommended Scope
[Outline Must-Have Phase 1 work, Optional Later Phase work, and explicit Exclusions.]

## 4. Recommended Capitol CoDesign Services
[Select 2 to 4 relevant services from the catalog below that directly address their stated problem, explaining why each is recommended:
${CAPITOL_SERVICE_CATALOG}
]

## 5. Phased Implementation Roadmap
- Phase 1: Discovery & Architecture Audit (Dependencies & scope confirmation)
- Phase 2: Build & System Integration (Core web engineering / workflow engine development)
- Phase 3: Testing, Enablement & Launch (End-to-end verification and full code/asset handoff)

## 6. Key Discovery Questions
[4 to 6 sharp, technical or operational questions to answer during discovery.]

## 7. Next Step
Ready to review this brief together? Schedule a focused 45-minute discovery audit or request a fixed-scope proposal via our quote form at /#quote, or call us directly at 916-616-8102.
`;

export default async function handler(req, context) {
  const reqOrigin = req.headers.get('origin') || '';
  const isAllowedOrigin =
    reqOrigin === 'https://capitolcodesign.com' ||
    reqOrigin === 'https://www.capitolcodesign.com' ||
    reqOrigin.endsWith('.netlify.app') ||
    reqOrigin.startsWith('http://localhost:');
  const allowedOrigin = isAllowedOrigin ? reqOrigin : 'https://capitolcodesign.com';

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Turnstile-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are supported.'
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Master kill switch check
  if (process.env.BRIEF_ENABLED === 'false') {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'SERVICE_UNAVAILABLE',
        message: 'The AI Project Brief generator is temporarily paused. Please reach us directly at 916-616-8102 or submit our quote form.'
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Read request body with size guard (max 16 KB)
  let rawBody = '';
  try {
    rawBody = await req.text();
    if (rawBody.length > 16384) {
      return new Response(
        JSON.stringify({
          error: true,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds 16KB limit.'
        }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: true, code: 'INVALID_BODY', message: 'Unable to read request.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let body = {};
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    return new Response(
      JSON.stringify({ error: true, code: 'INVALID_JSON', message: 'Malformed JSON payload.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const {
    email = '',
    businessName = '',
    goals = '',
    consent = false,
    website_hp = '',
    turnstileToken = '',
    submissionId = crypto.randomUUID()
  } = body;

  const clientIp =
    req.headers.get('x-nf-client-connection-ip') ||
    req.headers.get('client-ip') ||
    req.headers.get('x-forwarded-for') ||
    '127.0.0.1';

  // Honeypot bot trap
  if (website_hp && String(website_hp).trim().length > 0) {
    return new Response(
      JSON.stringify({ error: true, code: 'BOT_DETECTED', message: 'Spam submission blocked.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Input Validation
  const trimmedEmail = String(email).trim().toLowerCase();
  const trimmedGoals = String(goals).trim();
  const trimmedBusiness = String(businessName).trim().slice(0, 160);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'INVALID_EMAIL',
        message: 'A valid email address is required (maximum 254 characters).'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (trimmedGoals.length < 20 || trimmedGoals.length > 6000) {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'INVALID_GOALS',
        message: 'Project description must be between 20 and 6,000 characters.'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (consent !== true) {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'CONSENT_REQUIRED',
        message: 'Consent to project inquiry follow-up is required to generate a brief.'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Cloudflare Turnstile Verification
  const turnstileSecret = process.env.TURNSTILE_SECRET || process.env.CF_TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const isTurnstileValid = await verifyTurnstile(turnstileToken, clientIp, turnstileSecret);
    if (!isTurnstileValid) {
      return new Response(
        JSON.stringify({
          error: true,
          code: 'CAPTCHA_FAILED',
          message: 'Security verification failed. Please refresh the page and try again.'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Privacy-preserving IP Rate Limiting
  const salt = process.env.IP_HASH_SECRET || 'capitol-default-salt';
  const ipHash = crypto.createHash('sha256').update(clientIp + salt).digest('hex').slice(0, 16);
  const maxPerHour = parseInt(process.env.RATE_LIMIT_MAX_PER_HOUR || '6', 10);
  const now = Date.now();

  const userAttempts = rateLimitMap.get(ipHash) || [];
  const recentAttempts = userAttempts.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (recentAttempts.length >= maxPerHour) {
    return new Response(
      JSON.stringify({
        error: true,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'You have reached the maximum generation attempts for this hour. Please call us at 916-616-8102 or try again shortly.'
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '3600'
        }
      }
    );
  }
  recentAttempts.push(now);
  rateLimitMap.set(ipHash, recentAttempts);

  // Send asynchronous lead notification via Resend (fire and log without blocking response)
  sendLeadNotification({
    email: trimmedEmail,
    businessName: trimmedBusiness,
    submissionId,
    clientIpHash: ipHash
  }).catch(err => console.error('[Brief Resend Notification Error]:', err));

  // Initialize Streaming Response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const emitDelta = text => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
      };

      const emitDone = () => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, requestId: submissionId })}\n\n`)
        );
        controller.close();
      };

      const emitError = (code, message) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: true, code, message, requestId: submissionId })}\n\n`
          )
        );
        controller.close();
      };

      try {
        const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

        if (apiKey) {
          // Live LLM Provider Integration
          await streamFromLLM({
            apiKey,
            email: trimmedEmail,
            businessName: trimmedBusiness,
            goals: trimmedGoals,
            emitDelta
          });
        } else {
          // Pre-configured Scaffolding Stream Generator
          // Enables immediate testing of UI streaming, copy, and markdown download
          await streamScaffoldBrief({
            businessName: trimmedBusiness,
            goals: trimmedGoals,
            emitDelta
          });
        }

        emitDone();
      } catch (err) {
        console.error('[Streaming Error]:', err);
        emitError('STREAM_FAILURE', 'Stream generation encountered an interruption. Please try again.');
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}

/**
 * Cloudflare Turnstile siteverify
 */
async function verifyTurnstile(token, clientIp, secretKey) {
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);
    if (clientIp) params.append('remoteip', clientIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.success === true;
  } catch (e) {
    console.error('Turnstile verify error:', e);
    return false;
  }
}

/**
 * Resend Lead Notification Email (sent without raw brief payload per PRD section 11)
 */
async function sendLeadNotification({ email, businessName, submissionId, clientIpHash }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FROM_EMAIL || 'Capitol CoDesign <agency@capitolcodesign.com>';
  const toEmail = process.env.NOTIFICATION_EMAIL || 'agency@capitolcodesign.com';

  await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    reply_to: email,
    subject: `AI Project Brief Inquiry: ${businessName || email}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #101f33; max-width: 600px; margin: 0 auto; border: 1px solid #e6e3da; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #16283f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 600;">New AI Project Brief Lead</h2>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <p style="font-size: 15px; margin-top: 0;">A prospective client generated a project brief on capitolcodesign.com:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Email:</td><td><a href="mailto:${email}" style="color: #ec965a;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Business Name:</td><td>${businessName || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Timestamp:</td><td>${new Date().toISOString()}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Submission ID:</td><td><code>${submissionId}</code></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Consent:</td><td>Confirmed (Explicit Project Inquiry Consent)</td></tr>
          </table>
          <p style="font-size: 13px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 12px;">Lead generated via AI Project Brief Tool. Follow-up is qualified under explicit inquiry consent.</p>
        </div>
      </div>
    `
  });
}

/**
 * Live LLM Streaming Integration (OpenAI / OpenRouter compatible)
 */
async function streamFromLLM({ apiKey, businessName, goals, emitDelta }) {
  const provider = process.env.LLM_PROVIDER || 'openai';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  let endpoint = 'https://api.openai.com/v1/chat/completions';
  if (provider === 'openrouter') {
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Business Name: ${businessName || 'Not specified'}\n\nProject Goals and Bottlenecks:\n${goals}`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM provider error (${response.status}): ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) emitDelta(chunk);
        } catch {
          // ignore chunk parse artifacts
        }
      }
    }
  }
}

/**
 * Scaffolding Stream Generator
 * Provides realistic chunked streaming when LLM_API_KEY is not yet configured.
 */
async function streamScaffoldBrief({ businessName, goals, emitDelta }) {
  const company = businessName ? businessName.trim() : 'Your Business';
  const briefSections = [
    `# Project Brief: ${company}\n\n`,
    `## 1. Project Summary\nBased on your description, the primary goal is addressing operational bottlenecks: "${goals.slice(0, 160)}${goals.length > 160 ? '...' : ''}".\nCapitol CoDesign builds systems that remove repetitive overhead and convert website visitors into qualified appointments and sales, pairing custom web engineering with purpose-built automation.\n\n`,
    `## 2. Objectives & Proposed Success Measures\n- **Lead & Inquiry Capture**: Automate after-hours and weekend lead handling so zero qualified opportunities slip through.\n- **Operational Efficiency**: Target saving 10 to 20 staff hours per week by replacing manual intake and copying with direct system integration.\n- **Search & Assistant Visibility**: Position ${company} to be accurately indexed and cited by AI search tools (ChatGPT, Claude, Perplexity).\n*(Note: All target figures represent proposed architectural benchmarks, confirmed during discovery.)*\n\n`,
    `## 3. Recommended Scope\n- **Must-Have (Phase 1)**:\n  - Modern high-performance web structure with sub-second Core Web Vitals.\n  - Multi-layer secure intake forms with anti-bot defense (Turnstile + honeypot).\n  - Automated client intake routing directly into your CRM and team alerts via email/SMS.\n- **Optional Later Enhancements (Phase 2)**:\n  - Custom interactive quote or service estimator tool.\n  - Automated appointment booking calendar integration.\n- **Exclusions**:\n  - Proprietary locked CMS software, ongoing mandatory maintenance retainers.\n\n`,
    `## 4. Recommended Capitol CoDesign Services\n- **Web Design & Development**: Hand-coded HTML5/ESNext architecture with zero plugin bloat, WCAG 2.1 AA accessibility, and 100% source code ownership.\n- **Workflow Automation**: Direct pipeline integrations connecting your intake forms to your existing software stack (HubSpot, Salesforce, Resend, Google Workspace).\n- **Custom AI Agents**: Intelligent qualifying assistant engineered to capture lead specifics and escalate urgent opportunities directly to your principal staff.\n\n`,
    `## 5. Phased Implementation Roadmap\n- **Phase 1: Discovery & Architecture (Days 1–5)**: 45-minute working discovery session, detailed specification sign-off, and fixed-scope agreement ($0 surprise fees).\n- **Phase 2: Build & System Integration (Weeks 2–3)**: Frontend engineering, API and webhook configuration, Core Web Vitals tuning.\n- **Phase 3: Verification, Launch & Handover (Week 4)**: End-to-end testing, DNS transition, complete source code handover, and team enablement training.\n\n`,
    `## 6. Key Discovery Questions\n1. What CRM, spreadsheet, or inbox currently holds your customer inquiries, and who touches them first?\n2. What is your typical lead response time during business hours versus evenings and weekends?\n3. What specific qualification criteria determine whether an inquiry is an ideal client?\n4. What existing software tools are non-negotiable for your day-to-day workflow?\n\n`,
    `## 7. Next Step\nThis draft brief provides a practical foundation for your project. To confirm exact scope, timeline, and a binding fixed-scope proposal, let's connect:\n- **Submit Quote Details**: Visit [capitolcodesign.com/#quote](/#quote)\n- **Direct Principal Line**: Call **916-616-8102**\n`
  ];

  for (const section of briefSections) {
    // Break into realistic character chunks with micro-delays
    const words = section.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const slice = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
      emitDelta(slice);
      await new Promise(r => setTimeout(r, 25));
    }
  }
}

export const config = {
  path: '/api/project-brief'
};
