---
title: Capitol CoDesign - AI Project Brief Tool PRD
version: 1.0
date: 2026-11-19
owner: Gregg Maynard
status: Ready for implementation planning; production release requires approval
tags: [capitol-codesign, website, ai-project-brief, prd]
agent: Littlebird
---

# Capitol CoDesign
## AI Project Brief Tool - Product Requirements Document
Version 1.0 | November 19, 2026 | Owner: Gregg Maynard

## 1. Executive summary
Add a free AI Project Brief tool to capitolcodesign.com. A prospective client describes what they want to improve and receives a useful, editable planning brief grounded in Capitol CoDesign's actual services. The tool should demonstrate practical AI, qualify inquiries, and make the first conversation more productive.

Reuse the experience of the working Web Palm Beaches tool: email before generation, optional business name, project goals, streamed output, stop, revise, copy, download, and a clear next step. Adapt its branding, service recommendations, contact details, privacy language, and backend to Capitol CoDesign. This is a focused feature addition, not a website rebuild or hosting migration.

Important technical distinction: the reference tool uses PHP; the target repository uses static HTML with Netlify Node functions. Port the behavior, not the PHP deployment architecture. Production response headers checked November 19 show Netlify behind Cloudflare, consistent with the repository configuration.

## 2. Goals and boundaries
P0 goals:
- Turn vague website and operations needs into a structured project brief.
- Increase qualified inquiries while preserving the existing Get a Quote path.
- Show useful AI rather than add an open-ended chatbot.
- Recommend only services Capitol CoDesign actually offers.
- Keep ownership, fixed-scope proposals, and direct access to the principal central to the experience.

Out of scope for v1: full redesign, CMS migration, client accounts, payments, CRM integration, file uploads, website scraping, legal/medical advice, autonomous outreach, automatic formal quotes, database storage of goals or briefs, and a new booking platform. Do not change existing homepage marketing claims as part of this work unless they directly affect the feature.

## 3. Audience and positioning
Serve small and mid-sized business owners, operations managers, and marketing leads in Sacramento/Northern California and nationwide. Typical prospects need a better website, faster lead handling, fewer repetitive tasks, or clearer search visibility.

Match the existing plainspoken voice: practical, direct, specific, and honest about when AI is unnecessary. Keep Sacramento identity and nationwide availability. Do not copy South Florida references, Web Palm Beaches phone numbers, package prices, or strategy-call promises.

Canonical contact details for this feature: agency@capitolcodesign.com and 916-616-8102. Use the existing quote form for the primary handoff; no booking link has been verified.

## 4. Discovery baseline and source evidence
Reviewed November 19, 2026:
- Live target: https://capitolcodesign.com/ . Existing sections cover services, industries, process, AI practice, an ROI estimator, about, quote/contact, and newsletter. Three principal service pillars are Build, Automate, and Grow.
- Target source: https://github.com/oaklandunited/capitol-codesign-site . Root HTML site; netlify.toml publishes the repository root. netlify/functions/send-email.js uses Resend; _redirects maps /api/send-email and ends with a catch-all 404. The new page and API rules must precede that fallback.
- Reference experience: https://webpalmbeaches.com/project-brief . Live text confirms generation, copy/download/revise, a non-binding disclaimer, and contact handoff.
- Reference source: https://github.com/oaklandunited/Web-Palm-Beaches . Relevant files: project-brief.html, project-brief-api.php, config_loader.php, and config.example.php. The reference supports server-side LLM calls, SSE, input validation, and lead notification. Its prompt and service catalog are brand-specific.
- Prior implementation choices visible in November 19 Antigravity records: email capture before generation, direct server-side LLM calls, and no intro video. These inform parity; they do not require retaining PHP on the target site.

Evidence limits: repository README statements can lag deployed behavior. No real generation, email delivery, hosting dashboard configuration, billing settings, or production environment secrets were exercised in this research. Implementation must confirm the deployed commit and active Netlify project before changes.

## 5. Scope and priority
P0: dedicated /project-brief page; navigation/homepage/footer entry points; validated intake; server-side generation; safe streamed rendering; copy/download/revise/stop; consent and privacy notice; lead email; abuse and spending controls; existing quote-form handoff; responsive/accessibility testing; documented deployment and rollback.

P1 after launch: optional structured project-type/budget/timeline fields, emailed brief on explicit request, CRM routing with appropriate consent, richer attribution, and additional model providers. Do not delay v1 for these.

## 6. Entry points and page design
Add 'AI Project Brief' to desktop and mobile navigation and the footer. Add a secondary hero action, 'Create my AI project brief', without removing Get a Quote. Add one contextual entry in the AI practice section. Keep the existing ROI calculator independent; do not silently transmit its values.

Use /project-brief as the canonical route. Serve a standalone page with the current site's shared header/footer, typography, colors, spacing, buttons, and logo. Inspect actual CSS before using README color tokens. Do not bring over the entire reference stylesheet if it conflicts with current styles.

Suggested page copy:
- Heading: 'Turn your idea into a practical project brief.'
- Intro: 'Tell us what is not working and what you want to improve. Get a starting scope, relevant services, and questions worth answering before we talk.'
- Submit: 'Generate my project brief'.
- Result CTA: 'Discuss this project' linking to the existing quote form, plus 'Call 916-616-8102'.
- Disclaimer: 'AI-generated planning draft, not a quote or binding scope. Final scope, pricing, and timing are confirmed in a written proposal.'

Avoid labeling the output a cost estimate when it contains no validated pricing. Never promise guaranteed rankings, compliance, ROI, delivery dates, or performance results.

## 7. Visitor journey and input requirements
1. Visitor enters through a site link or direct URL.
2. They provide email, optional business name, goals, and explicit project-inquiry consent.
3. Client validation highlights issues; server independently validates everything.
4. After bot and budget checks, the tool generates a streamed brief. Notification failure must not prevent a useful brief.
5. Visitor can stop, revise, copy, download Markdown, start over, or contact Gregg.

Required fields: email, maximum 254 characters; goals, 20-6,000 characters after trimming; consent, literal boolean true. Optional business name: maximum 160 characters. Include a hidden honeypot and a server-verified Turnstile token. Enforce a small request-body cap, proposed 16 KB. Do not require a phone number, budget, login, or file upload.

Starter examples should cover: a contractor losing inquiries after hours; a professional-services firm replacing manual intake; and a local retailer improving product discovery. Examples must describe business problems, not promise regulated compliance.

Explain before submission that goals are sent to an AI provider and contact information goes to Capitol CoDesign. Warn against entering passwords, patient/client records, payment details, or other sensitive information. Consent to project follow-up must not subscribe anyone to marketing.

## 8. Generated brief requirements
Produce concise Markdown, target 550-850 words, with seven sections:
1. Project summary: business context, desired outcome, and assumptions.
2. Objectives and success measures: concrete outcomes; suggested metrics clearly labeled as proposed, not measured facts.
3. Recommended scope: must-have work, optional later work, and exclusions.
4. Recommended Capitol CoDesign services: two to four relevant services, each tied to a stated need; fewer if sufficient.
5. Phased roadmap: discovery, build/integration, launch/handover. Dependencies instead of binding dates.
6. Discovery questions: four to six specific questions exposing important unknowns.
7. Next step: discuss the brief through the existing quote form or phone.

The server-side catalog may include Web Design & Development; AI Strategy & Readiness Audit; Custom AI Agents; Workflow Automation; SEO/AEO & Paid Acquisition; Team Training & Enablement; and relevant supporting E-Commerce, Brand Identity, Content Systems, Analytics, or AI-enabled website capabilities verified on the current site. Recommend the smallest sensible scope, not every service.

Do not invent case studies, testimonials, integrations already in place, customer facts, savings, certifications, or prices. Do not reuse reference-site pricing. If asked for price, explain that a fixed-scope proposal follows discovery. Treat user text as untrusted project information, not instructions that override the system prompt. No tools, arbitrary URL fetches, email sending, or code execution are available to the model.

Quality gate: evaluate at least 10 varied sample projects, including vague input, no-AI-needed work, regulated industries, prompt injection, and out-of-scope requests. Results must remain useful, grounded, and non-binding.

## 9. Result interaction and accessibility
States: idle, validating, generating, complete, stopped/partial, rate-limited, unavailable, and failed. Show useful progress before first text. Preserve input on errors and revisions. Never auto-retry a paid generation.

Stop must abort the browser request and propagate cancellation upstream where the runtime supports it; partial output remains clearly labeled. Copy and Markdown download must preserve headings and lists. Label partial exports as incomplete. Revise preserves inputs; Start Over clears visitor text with confirmation if work would be lost. Avoid persistent browser storage in v1.

Use semantic labels, inline errors associated with fields, visible keyboard focus, logical focus movement, an accessible status region, reduced-motion support, and WCAG 2.1 AA as the tested target. Do not announce every streamed token to screen readers. Verify no horizontal overflow at 360px. Test 360, 390, 768, 1024, 1200, and 1440px; collapse navigation before crowding, based on the target design rather than blindly copying a breakpoint.

Render AI output as escaped text with a tightly restricted Markdown renderer. Disable raw HTML, images, arbitrary styles, scripts, and unsafe link protocols. Test both user-input and model-output XSS payloads.

## 10. Architecture and API contract
Preferred path: preserve the static site and add a modern Node Netlify Function, routed as POST /api/project-brief. Keep /api/send-email and its existing quote/newsletter behavior intact. Reuse safe Resend utilities, not unrelated anti-spam content/language blacklists. No framework migration is required.

Proposed files: project-brief.html; isolated brief CSS/JS assets following repo conventions; netlify/functions/project-brief.mjs; server-only prompt/service configuration; test fixtures; .env.example; and setup documentation. Update index.html, _redirects or function routing, applicable sitemap, and package lock as needed. Ensure server-only code, prompts, tests, and documentation are not publicly served merely because publish='.'. Verify function bundling and a deliberate publish allowlist/output arrangement; do not copy secrets into the publish directory.

Request JSON: { email, businessName, goals, consent, website_hp, turnstileToken, submissionId }. Generate submissionId once per deliberate attempt; reuse it on network retries. Validation and deduplication are server-side.

Before streaming: return JSON { error: true, code, message, requestId } with HTTP 400 for invalid input, 403 for failed bot/origin checks, 405 for unsupported methods, 413 for oversized bodies, 429 with Retry-After for limits, and 503 for unavailable configuration/provider/budget. Do not expose provider responses or secrets.

Success: HTTP 200, Content-Type text/event-stream, Cache-Control no-store. Emit delta {text}, done {ok:true, requestId}, or error {code,message,requestId}. An interrupted stream without done is not success. The browser must parse chunk boundaries, multiple events, and UTF-8 correctly. Midstream failures preserve partial output and offer deliberate retry.

Use one configurable provider/model for v1. Select it using an actual quality/latency/cost smoke test; keep the key, system prompt, service catalog, token limit, and provider endpoint server-side. Do not hardcode an unverified model name from the older source.

Netlify's current modern Functions API documents streaming responses with a 60-second execution limit. Legacy compatibility documentation differs. Use the modern handler and prove behavior in a deploy preview; configure an application timeout below the verified platform ceiling, initially no more than 45 seconds. If it cannot complete reliably, present a scoped backend alternative for approval rather than silently moving hosts or removing core behavior.

## 11. Lead delivery, privacy, and retention
After validation, bot checks, deduplication, and successful upstream acceptance, send one project-inquiry notification through Resend using a verified Capitol CoDesign sender. Default recipient: agency@capitolcodesign.com. Set reply-to to the validated prospect email. Include email, optional business name, timestamp, source='AI Project Brief', consent-copy version, and request ID. Do not include raw goals or generated brief by default.

Do not block generation on notification failure, and do not fire-and-forget work that the serverless runtime may terminate. Complete the bounded send or use a supported durable delivery mechanism. Log only delivery status and request ID. Use an atomic, expiring idempotency record to avoid duplicate notifications; retries of the same submission must not trigger duplicate paid generations.

No application database storage of goals or brief in v1. Separate expiring operational metadata is allowed for rate limits, deduplication, cost accounting, and error counts. Proposed retention: limiter/dedup records expire within 24 hours; content-free operational logs within 30 days where configurable. Never log request bodies, output, raw email, or secrets. Hash limiter identifiers with a server-held secret; recognize that hashed IP data still needs protection.

Privacy copy must accurately distinguish browser content, AI-provider processing/retention, lead email retained in the mailbox, and infrastructure logs. Do not claim 'nothing is stored' or 'private by design' without those qualifications. Verify provider data settings and add/update a reachable privacy notice before release.

## 12. Abuse prevention, security, and cost controls
Require valid production Turnstile configuration; do not inherit the existing email function's fail-open behavior. Validate expected hostname/action. Use a honeypot, trusted platform client-IP metadata, same-origin routing, explicit origin policy, and server-side validation. Same-origin checks are defense in depth, not bot protection. Do not use wildcard CORS.

Use an atomic shared limiter suitable for serverless instances, not local memory or /tmp. Initial proposed limit: six accepted generation attempts per IP per hour, plus deduplicated submission handling and a configurable global daily request/token budget. Choose a plan-compatible managed store or native platform capability; document the cost before adding a paid dependency. If shared controls are unavailable, fail closed for new paid generations and show contact alternatives.

Require an owner-approved daily spending ceiling before public enablement; enforce reservations so concurrent requests cannot all bypass a nearly exhausted cap. Bound input, output, retries, concurrency, and provider timeout. Expose a server-side kill switch. Never embed secrets in HTML, JavaScript, repo files, deployment logs, or downloaded briefs. Test direct requests to internal file paths.

## 13. Metrics and operational targets
Instrument brief_open, brief_submit, brief_first_text, brief_complete, brief_stop, brief_error, brief_copy, brief_download, and brief_contact_click through the site's approved analytics mechanism. Never send email, business name, goals, output, or other user content as analytics properties. Honor applicable consent settings. If analytics is absent, define the adapter and avoid installing a new vendor without approval.

Measure completion rate (done / accepted starts), contact-click rate after completion, median and p95 first-text/total latency, provider error rate, notification-delivery rate, and cost per completed brief. Collect a two-week baseline before promising conversion uplift.

Performance targets, not existing guarantees: median first text within five seconds under normal provider conditions; p95 completion within the configured runtime budget; no loading of model SDKs on unrelated pages; no material homepage regression. Measure mobile Core Web Vitals with an appropriate tool rather than treating a Lighthouse score as a Core Web Vitals score.

## 14. Acceptance tests and release gates
AT-01: /project-brief returns the intended page, not the catch-all 404; desktop/mobile/header/footer links work.
AT-02: valid input streams all seven grounded sections with correct Capitol branding; no reference-site prices, phone, or geography remains.
AT-03: field boundaries, malformed JSON, missing/false consent, large bodies, and unsupported methods return the specified errors without paid provider calls.
AT-04: invalid/missing Turnstile, honeypot, parallel rate-limit attempts, duplicate submission IDs, and exhausted daily budget do not bypass controls.
AT-05: provider timeout/429/5xx, missing key, disconnect, and truncated stream produce honest states; errors retain input and never mark partial output complete.
AT-06: Copy, download, revise, stop, Start Over, and keyboard/screen-reader flow work on Safari macOS/iPhone, iPad Safari, Chrome, and a representative Android browser.
AT-07: no executable HTML is rendered; secrets, prompts, and operational files are inaccessible through the static site; logs and analytics contain no submission content.
AT-08: one approved test lead arrives at the configured inbox with correct reply-to; retries do not duplicate it. Simulated email failure does not break generation.
AT-09: quote form, newsletter, calculator, redirects, homepage anchors, security headers, and existing pages pass regression checks.
AT-10: deploy-preview and production CDN behavior support streaming without caching prospect content; latency and cost measurements are recorded.

Automate validation/API/stream-parser/limiter tests with mocked provider and email responses. Run a small approved live provider/email test in preview and again after production release. A mocked stream alone does not establish working production integration.

## 15. Delivery plan and handoff
Phase 1 - confirm: verify active repo/deployed commit, Netlify project, runtime and preview routing; inventory the existing form and CSS; record baseline; confirm provider, sender, budget, privacy copy, and shared-store choice.
Phase 2 - implement: build branded page, server function, prompt catalog, controls, email, copy/download actions, and regression tests. Keep feature disabled without required configuration.
Phase 3 - preview: supply deploy-preview URL, test results, screenshots at required widths, sample briefs, measured latency/cost, and known limitations. Obtain approval before production promotion or any new paid service.
Phase 4 - release: merge through the target repository's existing deployment process. Do not copy the Web Palm Beaches FTP workflow into this Netlify project. Verify production and record the deployed commit. Roll back to the previous deploy and/or disable the endpoint if checks fail; retain contact alternatives.

Required handoff: implementation PR, configuration/secrets checklist (names only), prompt/catalog location, documented rate/budget controls, testing evidence, sender verification, privacy behavior, monitoring instructions, and rollback steps. Suggested environment names: LLM_PROVIDER, LLM_MODEL, LLM_API_KEY, existing RESEND_API_KEY/FROM_EMAIL/NOTIFICATION_EMAIL, existing Turnstile secret naming, RATE_LIMIT_* configuration, IP_HASH_SECRET, BRIEF_DAILY_BUDGET, and BRIEF_ENABLED. Reuse established names after inspection rather than creating conflicting duplicates.

## 16. Defaults and unresolved launch decisions
Proceed without further discovery using these PRD defaults: a feature addition rather than redesign; dedicated page; pre-generation email/consent; no generated-content storage; no automatic price ranges; no new scheduler; existing quote-form CTA; one provider; and Netlify-native backend where verified.

Launch blockers, not reasons to stop coding: owner-approved provider/model and usage budget; production credentials supplied securely; verified email sender and recipient; shared limit/idempotency mechanism; approved privacy text and reachable notice; preview/production configuration; and approval of production deployment. The builder must report these explicitly instead of inventing settings.

## 17. Submission instructions for the implementing agent
Implement this PRD in the current Capitol CoDesign website repository. First confirm the repository and runtime match the baseline. Preserve the existing site and quote/newsletter flows. Reuse the Web Palm Beaches interaction pattern, but do not import its PHP deployment, brand catalog, secret files, or pricing. Build and test in a branch/deploy preview. Present the implementation, test evidence, cost/configuration requirements, and any proposed deviations before production release. Do not change DNS, migrate hosting, subscribe to paid services, or email real prospects as part of development.

## 18. Technical references
- Capitol CoDesign live site: https://capitolcodesign.com/
- Target repository: https://github.com/oaklandunited/capitol-codesign-site
- Reference brief tool: https://webpalmbeaches.com/project-brief
- Reference repository: https://github.com/oaklandunited/Web-Palm-Beaches
- Modern Netlify Functions/streaming API: https://docs.netlify.com/build/functions/api/
- Legacy handler compatibility reference: https://docs.netlify.com/build/functions/lambda-compatibility/?data-tab=TypeScript

All findings describe the material inspected on November 19, 2026. Recheck active configuration during implementation.
