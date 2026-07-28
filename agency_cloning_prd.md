# 📋 Product Requirement Document (PRD) & Replication Blueprint
## Multi-Location Agency Website Architecture & AI Prompt Framework

---

## 1. Executive Summary & Vision

This Product Requirement Document (PRD) defines the complete technical, structural, visual, and content specifications for the **Capitol CoDesign** web application. It is designed as an authoritative blueprint for replicating and customizing this exact high-performance agency site model for multi-location agency brands.

### Core Value Pillars of the Agency Site Model:
1. **Sub-Second Core Web Vitals (100/100 PageSpeed)**: Hand-coded web architecture free of heavy page builders or third-party plugin bloat.
2. **Practical AI Automation Focus**: Clear positioning around background workflow engines (intake, quoting, scheduling, document drafting) that save client teams 15–30+ staff hours per week.
3. **Answer-Engine Optimization (AEO & GEO)**: Structuring site entity data and JSON-LD schemas for accurate Retrieval-Augmented Generation (RAG) retrieval by ChatGPT, Claude, Perplexity, and Google AI Overviews without data hallucinations.
4. **Transparent High-Trust Client Model**: 100% full source code ownership, direct 1:1 principal engineer access, and binding fixed-scope proposals ($0 surprise fees).

---

## 2. Core Architecture & Design System

### 2.1 Tech Stack Specification
- **Frontend Architecture**: Hand-coded HTML5, ESNext Vanilla JavaScript, Vanilla CSS with CSS Custom Properties (Design Tokens). Compatible with Next.js 15 App Router.
- **Styling Architecture**: Vanilla CSS using CSS variables (`--brand-navy`, `--brand-orange`, `--bg-body`, `--fg-body`). No heavy utility frameworks (Tailwind-free or zero-runtime CSS).
- **Security & Bot Defense**: Cloudflare Turnstile token validation (`data-action="turnstile-spin-v2"`), serverless backend API functions (`process.env.TURNSTILE_SECRET`, `process.env.RESEND_API_KEY`), and HTML string escaping sanitization.
- **Theme Engine**: Light and Dark mode switcher (`data-theme="light"` / `data-theme="dark"`) with forced WCAG AAA contrast ratio enforcement (11.4:1 contrast for cards and calculators).

### 2.2 Design Tokens & Theme Variables
```css
:root {
  --brand-navy: #101f33;
  --brand-navy-lt: #182c47;
  --brand-orange: #ec965a;
  --brand-peach: #f7c59f;
  --accent-ink: #a45213;
  --ink-deep: #0b1523;
  --radius: 12px;
  --radius-lg: 20px;
  --gutter: clamp(1.2rem, 3vw, 2.5rem);
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Section-by-Section Feature Matrix

### 3.1 Sticky Header & Navigation (`<header class="nav">`)
- **Logo Display**: Scales dynamically from `46px` to `40px` height when scrolled (`.nav.scrolled`).
- **Theme Switcher**: Instant toggle button switching between dark and light palettes.
- **Mobile Menu Drawer**: Collapsible overlay menu triggered on viewports `<1000px` (`.nav-toggle`).
- **Header CTAs**: Direct link to `#quote` form (`.btn-primary`).

### 3.2 Hero Section (`<section class="hero inv">`)
- **Headline**: High-converting title featuring animated accent glow (`animation: accentGlow 4s ease-in-out infinite alternate`).
- **Translucent Watermark Logo**:
  - *Desktop (`>1000px`)*: Positioned in top-right blank space (`top: clamp(-1rem, 0vw, 1.5rem); right: clamp(0rem, 1vw, 2rem); opacity: 0.24;`) so it sits cleanly above the stats column without text overlap.
  - *Responsive (`<=1000px`)*: Centered behind hero content (`top: 45%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08;`).
- **Stats Column (`.hero-side`)**: Displays key agency proof points (e.g., *30+ Years experience*, *100% Custom builds*, *Area code local badge*).

### 3.3 Regional Geo Coverage Hub (`.geo-hub`)
- **Entity Badges**: Bar displaying regional sub-market badges (e.g. *Sacramento, Roseville, Folsom, El Dorado Hills, Davis, Rocklin, Elk Grove, Bay Area*).
- **Purpose**: Establishes local geographic relevance for Google Maps & local AEO queries.

### 3.4 Machine-Readable AEO Fact Sheet (`.aeo-factsheet`)
- **Blockquote Format**: High-density summary block explicitly stating agency credentials, location, fixed-pricing policy, and technical stack.
- **Target Audience**: Formatted for direct extraction by AI search crawlers (GPTBot, ClaudeBot, PerplexityBot).

### 3.5 Core Services Grid (`#services`)
- **3 Anchor Cards**:
  1. **Build**: Custom Web Design & Development (100/100 Core Web Vitals, WCAG 2.1 AA).
  2. **Automate**: AI Integration & Automation (Intake, quoting, background agents).
  3. **Grow**: Search, SEO & AEO Acquisition (Technical SEO, local GEO, RAG retrieval).
- **4 Mini Capability Badges**: E-Commerce, Brand Identity, Content Systems, Analytics.

### 3.6 Industry Verticals Matrix (9 Interactive Cards) (`#industries`)
- **Card Matrix**: 9 industry-tailored cards (Legal/Professional, Home Services, Healthcare, E-Commerce, B2B Tech, Real Estate, Culinary/Restaurants, Hospitality/Hotels, Independent Local Businesses).
- **Card Interactive Affordance**: Each card features a circular **Expand Arrow Icon Badge (`↗`)** in the top-right corner that scales up (`1.18x`) and rotates (`45°`) on hover.

### 3.7 Interactive Pop-up Modal System (`#aiModal`)
- **3 Modal Collections**:
  1. **AI Work Modals (`data-ai-work`)**: Category badge, key deliverables, tech stack pills, and quote CTA.
  2. **AI Engagement Step Modals (`data-ai-step`)**: Phase badge (`01-05`), progress bar (`20%-100%`), deliverables, timeline commitment, and step-by-step navigation buttons (`Next Phase →`).
  3. **Industry Vertical Modals (`data-ind-card`)**: Industry badge, custom solutions list, integration pills, and industry CTA.
- **Modal Mechanics**: Event delegation (`e.target.closest()`), `ESC` key listener, backdrop click closing, body scroll locking (`overflow: hidden`), and keyboard accessibility.

### 3.8 Interactive AI & Web ROI Calculator (`#roiCalculator`)
- **Input Sliders**:
  - Weekly manual admin hours slider (`5` to `60` hours/week).
  - Hourly team cost slider (`$25` to `$120`/hour).
- **Formula**:
  - `Annual Hours Saved = Weekly Hours * 0.70 * 52`
  - `Annual Dollar Savings = Weekly Hours * Hourly Rate * 0.70 * 52`

### 3.9 Tech Stack Showcase (`#tech-stack`)
- **4 Columns (Timeless, Version-Free)**:
  1. **Modern Frontend**: Next.js & React, TypeScript Strict, Tailwind & Motion, Headless CMS.
  2. **AI & Automation**: Google Gemini AI, OpenAI & Claude, LangChain & LlamaIndex, Python & Node.
  3. **Cloud & Edge**: Cloudflare Edge Security, Resend API, Serverless & Edge Runtime, Supabase & Postgres Vector.
  4. **AI Search & GEO Analytics**: AEO & GEO Schemas, Google AI Overviews, Plausible & GA4, RAG Technical Formatting (GPTBot & PerplexityBot).

### 3.10 Speed vs. Bloated Builders Comparison (`#speed-compare`)
- **2-Column Breakdown**: Contrasts 100/100 CWV hand-coded architecture against heavy Elementor/Divi WordPress themes.

### 3.11 Agency Feature Matrix (`#agency-compare`)
- **Table Structure**: Compares Capitol CoDesign vs. Traditional Agencies (100% code ownership, 1:1 principal engineer access, fixed-scope proposals, zero monthly retainer lock-in).

### 3.12 FAQ Accordion & JSON-LD Schema (`#faq`)
- **Transparent RAG Retrieval Copy**: Questions and answers structured around RAG data readiness, entity verification, and hallucination prevention (no overpromising or algorithm control claims).
- **JSON-LD `FAQPage` Schema**: Embedded in `<script type="application/ld+json">`.

### 3.13 Multi-Step Contact & Quote Form (`#quote`)
- **Field Options**: Name, email, phone, business type, service interest checklist (Web, AI, SEO/AEO), project timeline, budget range.
- **Turnstile Defense**: Cloudflare Turnstile token validation (`0x...`).
- **Dynamic Helper Card (`.qf-helper`)**: Contextual guidance based on selected budget.

---

## 4. AI Prompt & Interview Questionnaire Engine
### (Use this section to train an AI to interview you and generate a new agency clone)

When you are ready to build a new agency website for a different geographical location, paste the following prompt block into an AI session.

```markdown
SYSTEM INSTRUCTION FOR AI AGENT:
You are an expert web software architect and copywriter tasked with replicating the Capitol CoDesign high-performance agency website for a new geographical location and market focus. 

Your goal is to conduct a structured, step-by-step interview with me to extract all necessary details, and then generate the complete, customized `index.html` file, CSS theme, JSON-LD schemas, and modal data dictionaries.

Please ask me the following questions in order, waiting for my responses before proceeding:

---

### STEP 1: GEOGRAPHIC & REGIONAL ANCHORS
1. What is the official name of the agency for this new market?
2. What primary metro area / city will this agency serve (e.g. Austin, TX / Miami, FL / Denver, CO)?
3. What are 6 to 8 key sub-market towns, neighborhoods, or surrounding business hubs for your local GEO badge bar?
4. What local area code should be highlighted in the hero stats (e.g. 512, 305, 303)?

---

### STEP 2: BRAND IDENTITY & PRINCIPAL EXPERIENCE
5. Who is the Principal Engineer / Founder for this branch, and what is their years of experience (e.g. 15+ years, 25+ years)?
6. What is the agency's primary contact email and phone number?
7. Do you have a custom logo asset, or should we use a styled text/SVG logo mark?
8. Do you want to adjust the brand color palette (e.g., Deep Navy & Orange vs Slate Navy & Emerald Green)?

---

### STEP 3: SERVICE OFFERINGS & PRICING
9. Are there any specific local services you want to emphasize or adjust in the 3 core pillars (Build, Automate, Grow)?
10. What is your typical project budget range for this market (e.g. $3,500–$15,000)?
11. Are there specific software tools or CRMs popular in your region that we should highlight in the automation section?

---

### STEP 4: INDUSTRY VERTICALS
12. Out of our 9 standard industry verticals (Law Firms, Home Services, Healthcare, E-Commerce, B2B Tech, Real Estate, Restaurants, Boutique Hotels, Local Services), which 6 to 9 should be featured on this site?
13. Are there any region-specific industries you want to add (e.g., Wineries & Vineyards, Solar & Renewable Energy, Marine & Boating)?

---

### STEP 5: DEPLOYMENT CREDENTIALS
14. What is your Cloudflare Turnstile Site Key for form protection on this domain?
15. What is the target domain URL (e.g. https://austincodesign.com)?

---

Once I answer these questions, generate the complete, unabridged production `index.html` code with all updated schemas, modals, and text!
```

---

## 5. Step-by-Step Deployment & Verification Protocol

1. **Environment Setup**:
   - Save the generated `index.html` in the project root directory.
   - Place logo assets in `/assets/logo.png`.
2. **Turnstile Secret Wiring**:
   - Ensure `process.env.TURNSTILE_SECRET` and `process.env.RESEND_API_KEY` are configured in your Netlify or Cloudflare environment variables.
3. **Core Web Vitals Verification**:
   - Run Google Lighthouse audit to confirm **100/100 Performance, Accessibility, Best Practices, and SEO**.
4. **Git Branching & Deployment**:
   ```bash
   git add index.html
   git commit -m "Deploy new agency clone site for [City Name]"
   git push origin main
   ```
