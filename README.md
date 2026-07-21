# Capitol CoDesign

Marketing site for Capitol CoDesign. Static, self contained, no build step.

**Live:** https://capitolcodesign.com

---

## What this is

A single page site written as plain HTML and CSS. There is no framework, no bundler, and no package manager. `index.html` contains the entire page including its styles and scripts, which means you can open it directly in a browser and see exactly what production looks like.

```
.
├── index.html      the whole site
├── 404.html        not found page
├── netlify.toml    build, headers, caching
├── _redirects      legacy WordPress paths
├── robots.txt
├── sitemap.xml
└── .gitignore
```

## Local development

No install, no server required.

```bash
open index.html
```

If you want a local server so that absolute paths behave the way they do in production:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

Connected to Netlify. Every push to `main` publishes automatically. Pull requests get a deploy preview, and those previews are excluded from search indexing.

There is nothing to build. `netlify.toml` sets `publish = "."` and an empty build command, so Netlify copies the repo as-is.

## How the design system works

All colors live as CSS custom properties at the top of `index.html`. Components never reference a raw hex value, only semantic tokens, so the two themes stay in sync automatically.

```
--brand-navy    #223a60    primary
--brand-navy-lt #274869    secondary
--brand-orange  #ec965a    accent
--brand-peach   #f1b98c    accent light
--orange-deep   #a45213    accent as text on light surfaces
--ink-deep      #101f33    darkest ink, used everywhere black would be
--cream         #f7f3ea    light theme alternate surface
```

Two things worth knowing before you change a color:

**`--brand-orange` cannot be body text on a light background.** It measures 2.31:1 against white, well below the 4.5:1 minimum. `--orange-deep` is the same hue darkened until it clears the threshold on both white and cream. Use it for any accent text on a light surface.

**There is no black in this design.** `--ink-deep` does every job black would have done. It reads 16.59:1 on white and 7.17:1 on the orange button fill.

Every token carries its measured contrast ratio as an inline comment. If you change a value, that comment tells you what the original was protecting.

### Themes

Light and dark are both fully designed, not one derived from the other. The toggle sits in the nav. First visit follows the operating system preference, after which the choice is remembered in `localStorage` under `cc-theme`.

Sections marked `.inv` are navy in both themes, so their contrast ratios hold regardless of which theme is active.

### Textures

Five industrial textures (blueprint grid, engineering hatch, survey contours, circuit traces, perforated plate) are inline SVG data URIs defined as CSS variables. No network requests, no licensing, sharp at any pixel density, each under a kilobyte.

Their opacities are deliberately low. Text over a texture sits on a lighter surface than flat background, and those compound values were measured. Raising a texture opacity can break contrast even though the token colors did not change.

### Motion

Scroll progress bar, drifting hero blueprint, trust bar ticker, staggered card reveals, hero stat count up, and drawing connector lines. All of it is disabled under `prefers-reduced-motion`, resolving to the finished state rather than merely running faster.

## Accessibility

Targets WCAG 2.1 AA and currently meets it, with most pairs at AAA.

- Every text and background pair verified in both themes, including text over textures
- Controls and focus rings meet the 3:1 non-text minimum
- Decorative logo instances carry `alt=""` and `aria-hidden`
- Form inputs are labelled, the checkbox group is a `fieldset` with a `legend`
- Reduced motion fully honoured

If you change a color, re-check it. A contrast checker such as WebAIM's takes a few seconds and this site sells accessibility-conscious work, so its own audit needs to be clean.

## Before this goes live

- [ ] **Replace the case studies.** Currently structured placeholders with `[Client Name]` and `+000%`.
- [ ] **Replace or remove the testimonials.** They are placeholders. Publishing invented client quotes as real is deceptive advertising.
- [ ] **Confirm the pricing.** The three tiers are illustrative anchors, not agreed numbers.
- [ ] **Wire up the forms.** The quote form and newsletter signup are front end only and currently fire an `alert()`. Point them at Netlify Forms, Formspree, or your own endpoint.
- [ ] **Host the logo locally.** It is currently referenced from the WordPress uploads directory. Move it into this repo, ideally as SVG.
- [ ] **Reconcile the experience claim.** This site says 30+ years; webpalmbeaches.com says 20+.

Sections with placeholder content display a visible orange notice so they cannot ship unnoticed. Delete the `.placeholder-note` blocks once the real content is in.

## Wiring up the forms

Netlify Forms is the least work. Add `netlify` and a `form-name` to the form tag:

```html
<form class="qf-card" id="quoteForm" name="quote" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="quote">
  ...
</form>
```

Then remove the `preventDefault()` handler at the bottom of `index.html` so the browser submits normally. Submissions appear in the Netlify dashboard under Forms.

## Browser support

Modern evergreen browsers. Uses `color-mix()`, `aspect-ratio`, CSS custom properties, and `IntersectionObserver`. No IE support and none intended.
