# RISCH Wealth — Frontend (React)

React + Vite migration of the original static `risch-wealth/*.html` site.
It started as a 1:1 framework migration. Since then it has been redesigned
as a private-wealth site (see "Design system"), and has gained an employee
login page, a home-page FAQ and a full SEO/performance pass. See "Change
log" at the bottom.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/, every route prerendered to HTML
npm run preview  # serve the production build locally
```

The Risk Profiler page calls the backend in `../be` — run that too
(`cd ../be && npm install && npm start`), or the profiler will show a
"couldn't load" message instead of the quiz. All requests go to relative
`/api/...` paths: in dev, Vite's dev server proxies those to
`http://localhost:4000` (see `vite.config.js`); in production, nginx
proxies them to the backend on the same domain (see `../deploy/`). You
only need `.env` / `VITE_API_BASE_URL` if the API is on a different host
entirely — see `.env.example`.

## Deploying

In production this doesn't run `npm run dev`/`preview` — it's built into
a Docker image (`Dockerfile`) that bundles the static build with its own
nginx, which also proxies `/api` to the backend container
(`docker/nginx.conf`). Run both containers via `docker-compose.yml` at
the repo root. Full steps: `../DEPLOY.md`.

## Structure

```
Dockerfile           builds the production image (see "Deploying" above)
docker/nginx.conf    the container's own nginx config (static + /api proxy,
                      gzip, per-page HTML routing, real 404s, caching)
scripts/prerender.mjs  build step: renders every route to static HTML,
                      writes sitemap.xml, warns on title/description length
public/              copied as-is into the build: robots.txt, llms.txt,
                      favicons, og-image.png (link-preview image), logo.png
                      (used by schema.org), Google Search Console file
src/
  assets/            logo, founder photo
  styles/            styles.css + profiler.css, copied verbatim from the
                      original site and imported globally in main.jsx
  api/
    riskProfilerApi.js  fetch wrappers for the backend's risk-profiler
                        endpoints (config + score)
  utils/
    format.js          fmtINR / pct — display-only formatting, not logic
  data/
    firm.js          firm facts in one place: name, email, phone, founding
                      year, and the optional client count / assets /
                      minimum / registrations / grievance fields. Fields
                      left null are hidden, so nothing unverified shows.
    segments.jsx     client profiles (Who We Serve page + home page)
    testimonials.js, perspectives.js  static content for those pages
  components/
    Nav/             shared site nav: 5 links, Client Login, "Start a
                      conversation" CTA, theme toggle, mobile burger
    Footer/          charcoal footer: entity, links, registrations (from
                      firm.js), disclaimer, employee sign-in link
    TestimonialSlider/
    ScrollToTop.jsx  restores per-page-load scroll-to-top behavior under
                      React Router, since the original was a multi-page site
    RouteHead.jsx    keeps <head> (title, description, canonical, Open
                      Graph/X tags, JSON-LD) in sync on client-side navigation
  hooks/
    ThemeContext.jsx     dark/light mode, persisted to localStorage
    useScrollReveal.js   re-implements the original IntersectionObserver
                         scroll-reveal effect per route
  seo.js             single source of truth for every page's title,
                      description, noindex flag, the home-page FAQ, and the
                      schema.org structured data. Edit page SEO copy here.
  main.jsx           browser entry: hydrates the prerendered HTML
  entry-server.jsx   build-time entry: renders a route to an HTML string
  pages/
    Home.jsx, About.jsx, WhoWeServe.jsx, Solutions.jsx, Testimonials.jsx,
    Perspective.jsx, Disclosure.jsx, Contact.jsx, EmployeeLogin.jsx,
    NotFound.jsx
    RiskProfiler/
      RiskProfiler.jsx   the multi-step questionnaire (intro -> basics ->
                         8 questions -> report), state-machine driven
      RiskProfilerConfigContext.jsx  fetches the question bank + tier
                         data from the backend once and shares it down
                         the page tree
      report/            the 4-page printable proposal (donuts, tables,
                         tier tabs), split into small presentational
                         components. These only render numbers — they
                         never compute a tier or an allocation
                         themselves; that comes from the backend.
```

**Important:** the question bank, the suitability grid, the tier
allocations, and the actual scoring math used to live in this folder
(`data.js` + `scoring.js`) but have been moved to `../be` — see
`be/README.md`. That's what a future superAdmin config screen will edit,
and this frontend is just a client of it now.

## Routes

| Where it's linked                               | React route       |
|-------------------------------------------------|-------------------|
| (logo)                                          | `/` (Home)        |
| Nav: The Firm                                   | `/about`          |
| Nav: Who We Serve                               | `/who-we-serve`   |
| Nav: Solutions                                  | `/solutions`      |
| Nav: Testimonials, footer: Client Experiences   | `/testimonials`   |
| Nav: Perspective                                | `/perspective`    |
| Nav: Disclosure, footer: Disclosures            | `/disclosure`     |
| Nav: Contact, "Start a conversation" buttons     | `/contact`        |
| Nav: "Start Risk Profile" button, "Take the risk assessment" buttons | `/risk-profiler` |
| Footer: Employee sign-in                         | `/employee-login` (noindex) |
| Nav: Login → Client                              | `/client-login` (noindex) |
| After staff sign-in                              | `/employee-portal/*` (noindex; one prerendered page, nginx serves it for every sub-path) |
| After client sign-in                             | `/client-portal` and `/client-portal/{portfolio,transactions,statements,risk-profile,messages,profile}` (noindex) |
| anything else                                   | 404 page (noindex, real 404 status) |

"Client Login" (nav and footer) goes to `/client-login`; its "View your
portfolio" button opens `FIRM.clientLoginUrl` (Wealth Elite) in a new tab.

## Design system

`src/styles/styles.css` (v3, "private-wealth editorial"):

- **Colour:** warm ivory ground (`--bg #FAF6F0`), sand for alternate
  sections (`--bg-tint`), charcoal text and primary buttons (`--ink
  #1C1A17`). The logo orange `--orange #F1650C` is only used for graphics
  and hairlines (it's 2.95:1 on ivory). Orange *text* uses `--accent
  #B24A07` (5:1). Dark mode is still available from the toggle, but light
  is the default (`index.html` + `ThemeContext`). The footer is charcoal
  in both themes.
- **Type:** Cormorant Garamond (self-hosted variable font, picked to echo
  the logo's serif) for `.display-*` headings, with lining numerals.
  Inter for everything else, including the smaller `.display-s` headings,
  where Cormorant gets too thin.
- **Shape:** squared 4px buttons (no pills), flat hairline-bordered cards,
  and numbered serif sequences (01, 02…) instead of icon tiles.
- The printable proposal (`profiler.css`, `.report-page`) pins its own
  palette and isn't affected by the site theme.

**Home page order:** hero → trust bar → philosophy ("Risk first. Return
follows.") → how we work (5 steps) → who we serve → what we do → why
RISCH → founder → client experiences → risk assessment (secondary CTA)
→ FAQ → closing CTA.

**Firm facts:** the trust bar, footer and schema read from
`src/data/firm.js`. The trust bar shows only facts the site already
states (career length from the About timeline, founding year, no
proprietary products, the 8-point diagnostic). `clientCount`, `assets`,
`minimumInvestable`, `registrations` and `grievance` start as `null`/empty
and appear automatically once filled. Only add figures that are accurate
and cleared by compliance.

**Adding a page:** add the `<Route>` in `App.jsx` *and* an entry in
`PAGES` in `seo.js`. The prerender step renders exactly the routes listed
in `PAGES`, and nginx serves anything not prerendered as a 404.

## SEO & performance

How the production build works (`npm run build`):

1. `vite build`: the normal client bundle.
2. `vite build --ssr src/entry-server.jsx`: a Node-side copy of the app.
3. `node scripts/prerender.mjs`: renders every route in `seo.js` `PAGES`
   to `dist/<route>.html` (home is `index.html`, plus `404.html`), injects
   that page's `<head>` tags into the `<!--app-head-->` placeholder in
   `index.html`, and writes `dist/sitemap.xml` (indexable pages only).

In the browser, `main.jsx` hydrates that HTML instead of rendering from
scratch. So crawlers, link previews and AI tools that don't run
JavaScript still see the full page text and the right tags. In `npm run
dev` there's no prerendering; `RouteHead` sets the tags client-side.

Because pages are rendered at build time, component code must not touch
`window`, `document` or `localStorage` during render, only inside
`useEffect` or event handlers. Rendered output must also not depend on
browser-only state, or hydration will mismatch. That's why the theme
toggle's sun/moon icons are switched by CSS (`html[data-theme]`) rather
than an inline style.

Per page (from `seo.js`):
- `<title>` (50–60 chars) and meta description (120–160 chars). The build
  prints `SEO warning` if an indexable page falls outside those ranges.
- `<link rel="canonical">` pointing at `https://rischwealth.com/...`
- `robots` meta (`noindex` for `/employee-login` and the 404 page)
- Open Graph + X (Twitter) card tags, image `public/og-image.png` (1200×630)
- JSON-LD: `FinancialService` (the firm), `Person` (founder), `WebSite`,
  the page itself, and `FAQPage` on the home page only

Site-wide:
- `public/robots.txt` allows all crawlers (including AI crawlers), blocks
  `/api/`, and points at the sitemap. `public/llms.txt` is a plain-text
  summary of the firm for LLMs.
- Fonts are self-hosted (`@fontsource-variable/inter` for body text,
  `@fontsource-variable/cormorant-garamond` for headings), and both Latin
  files are preloaded by the prerender step. There are no Google Fonts
  requests.
- The logo (`src/assets/logo.png`) is sized for its 32px display height
  (10 KB, was 267 KB). The favicons are generated from the logo's "R".
- `docker/nginx.conf` gzips text assets, caches hashed `/assets/` files
  for a year and HTML with `no-cache` (so deploys show up immediately),
  redirects `/page/` → `/page`, and returns a real 404 for unknown URLs.

The home-page FAQ answers (`FAQS` in `seo.js`) are also emitted as
FAQPage schema, so the visible text and the schema can't drift apart.
Every answer restates something the site already says elsewhere. Keep it
that way, and have compliance review any change.

Lighthouse (mobile, local Docker builds):

| | Before SEO pass | After SEO pass | After redesign |
|---|---|---|---|
| Performance | 58–71 | 99 | 98–99 |
| Accessibility | 93–95 | 95 | **100** |
| Best Practices | 96–100 | 100 | 100 |
| SEO | 92 | 100 | 100 |
| Home page weight | ~960 KB | ~175 KB | ~250 KB (adds the serif font) |

Accessibility reached 100 once buttons moved to charcoal and orange text
to `--accent`. White on the logo orange was only 3.2:1.

## Known gaps (by design, until more of the backend exists)


- The contact form has no backend. On submit it opens the visitor's
  email app with a pre-filled message to `FIRM.email`. Once the API can
  send or store enquiries, POST the form there instead.
- Perspective's blog posts are hard-coded placeholder content
  (`src/data/perspectives.js`) pending a real CMS/backend.
- The risk profiler's basic-details step (name/email/phone) is not
  persisted anywhere yet — only the answers are sent to `../be`, and only
  to compute a result, not to save a submission record.

## Change log

Newest first.

**What We Provide rebuilt: "Risk first. Portfolio second."**
- Visual language: the same as Get In Touch and Testimonials: the ivory
  ground with soft radial tints and paper grain, copper hairline arcs
  bottom-left, a serif title with an accent second line, ink type and
  hairline rules; the disciplines sit on a sand band; the footer is the
  only navy. The hero scene is drawn in ink on ivory and follows the
  light / dark theme.
- `pages/Solutions.jsx`: hero with one quiet three.js scene; a risk
  profile gate; a portfolio architecture that adapts to the visitor's risk
  profile; four disciplines (sticky title, scrolling items); the seven
  principles as a manifesto with a small ring that tracks the active one;
  the process; an adaptive call to action. Native scrolling throughout, no
  scroll-jacking. Removed: the 3D carousel, the seven-card wheel, the donut
  chart and `framer-motion`.
- Hero scene (`components/solutions/`): `heroLayout.js` (shared geometry),
  `HeroScene.jsx` (SVG composition + labels, real text), `heroScene3d.js`
  (three.js: rings round "You" that settle into alignment, then six blocks
  emerge; pointer tilt of at most 3 degrees; pauses off screen; disposes
  everything). three.js loads after the page is idle. Phones, reduced
  motion and no WebGL get the SVG composition only.
- Personalisation: `hooks/useRiskProfile.js` reads the signed-in client's
  saved profile (`/api/auth/status`, then `/api/client/risk-profiles`).
  `components/solutions/portfolioExperience.js` turns it into the
  prominence of each building block, from the risk engine's own split per
  mandate: a bucket at 0 (tier 4 has no international equity) hides that
  block; the two largest are "most relevant", the smallest "supporting".
  No percentages, returns or recommendations are produced. Commodities and
  real estate have no bucket in the engine, so they stay standard for every
  profile (marked TODO for the firm's approved rules).
- Anonymous visitors' results are not stored anywhere (only signed-in
  clients', in `risk_profiles`), so they see the default, educational
  architecture. The CTA becomes "Review Risk Profile" once a profile exists.
- Backend: `GET /api/auth/status` returns `{ user }` (null when signed out)
  with a 200, so public pages can check the session without a 401 in the
  console.

**What We Provide redesign (Figma + review)**
- `pages/Solutions.jsx` + the "WHAT WE PROVIDE (Figma, Oct 2026)" block in
  `styles/styles.css` (`.sv-*`). Sections: hero ("Four disciplines. One
  portfolio." with a supporting line and the boardroom image); the four
  disciplines as rows, each a link to `/contact?topic=<discipline>` (the
  Contact page pre-selects that topic); "Principles before products." (the
  brochure's seven principles word for word, from `data/principles.jsx`,
  four cards then three centred);
  "What we allocate across." with an equal-segment ring (no proportions:
  there is no model portfolio) and five asset-class cards; the new "From
  conversation to a coherent portfolio." (Understand, Construct, Review);
  and "A portfolio built around your life." with Start Risk Profile / Get
  In Touch.
- Contact topics now list the four disciplines; `?topic=` is applied after
  mount so the prerendered page still hydrates cleanly.
- Old allocation-stack styles (`.alloc-intro`, `.alloc-stack`, …) removed.
- Lighthouse: mobile 97 / 100 / 100 / 100, desktop 100 across the board.

**Rising arrow above the RISCH wordmark (brochure logo)**
- `components/BrandArrow.jsx`: the arrow from the printed RISCH logo,
  traced from the brochure artwork and redrawn with smooth curves (hairline
  tail after the "I", swoosh over "S" and "C", head over the "H"). It takes
  the colour of the wordmark it sits on.
- Where: the site header and the portal sidebars (typeset wordmark over the
  ring: `.wm-arrow`, sized in em from the letter positions, dark like the
  letters), and the footer and the risk-profile proposal
  (`components/LogoMark.jsx`: `logo.png` + arrow, sized with `--h`, orange).
- `assets/logo.png` cleaned: its semi-transparent edge pixels were white
  (cut out from a white background), which showed as a light outline on the
  navy footer on retina screens. They now carry the neighbouring orange;
  same size, 9.6 KB.
- Not changed: favicon, apple-touch icon and social preview image
  (`public/`), which are small static images.

**Footer redesign (Figma)**
- `components/Footer/Footer.jsx` + the `.footer` rules in
  `styles/styles.css`: RISCH / Private Wealth with the mission ("Our
  Mission — Investor Success", "Investors Trust Us Because We Put Them
  First.") and LinkedIn; The Firm and Clients link columns and Our Office
  with icons, each heading with a short orange rule; a registration band
  (shield, registration note, ARN and APRN); then the mutual fund risk
  warning (kept on request, and required for an AMFI-registered
  distributor) and the bottom line: copyright, the "Trust. Discipline.
  Performance." motto (kept on request), and legal links.
- Privacy Policy and Terms of Use (in the design) have no pages yet, so
  only Disclosures shows; set their `to` in `LEGAL_LINKS` when the pages
  exist. Instagram stays hidden. The old "Connect" column is gone
  (LinkedIn sits under the mission).

**Contact page redesign (Figma)**
- New layout (`pages/Contact.jsx`, "CONTACT (Figma, Sept 2026)" block at
  the end of `styles/styles.css`), built to the Figma's proportions at
  1536px: "Let's talk about your financial goals.", the message card
  (about 46% of the width), a ruled details column (email, call, office
  with "Get directions" to Google Maps, registration, LinkedIn), and the
  Figma's boardroom image as a full-height panel at the right edge from
  1360px up. The panel's width follows its height (`aspect-ratio`), so
  the S-curve drawn into the image is never cropped; the image
  (`assets/contact-office.webp` + `-2x`) has a transparent, anti-aliased
  area left of the curve, so it works in dark mode, and the cream band
  behind it is the same shape (CSS mask). Room for it is reserved with
  `--ct-reserve`.
- Form: country code + phone number (India first, then common NRI
  countries), "I'm interested in" starts unselected, message now required
  with a 500-character counter. The card stacks its fields when it's
  narrow (container query). Still hands off to the visitor's email app
  (no mail backend yet).
- Footer: see "Footer redesign (Figma)". Instagram stays hidden.

**Portfolio value chart**
- `components/ValueChart.jsx`: value (orange) and amount invested (blue
  step line) over time on one ₹ axis, with 1M / 3M / 6M / 1Y / 3Y / All
  (only ranges the data covers), a hover and arrow-key crosshair with a
  tooltip, and a "View as table" (month ends). Colours
  (`--chart-value`, `--chart-invested`) passed the dataviz palette
  validator in light and dark.
- Shown on the client Overview and Portfolio pages and on each client's
  page in the staff portal. While past NAVs are still being fetched for a
  new fund, a note says so.

**Light portal sidebars (Figma)**
- Both portals use a light ivory sidebar (`.cp-light` rules at the end of
  `styles/portal.css`) with a peach active item and `components/RingLogo.jsx`:
  the static brochure ring behind the RISCH wordmark (same geometry as the
  site header's `LogoRing`, without Three.js). The staff sidebar dropped
  its role label and employee ID, as in the design.

**Required fields marked with \***
- `components/Req.jsx`: `<Req />` (the orange \* after a label) and
  `<ReqLegend />` ("\* Required" at the top of the form). Required inputs
  also get `aria-required` for screen readers.
- Marked only where the form actually requires the field: Contact (name,
  email), client sign-in and sign-up, employee sign-in, change password,
  portal Messages (message) and Your details (full name), staff Record a
  purchase (client, fund, date, amount, NAV) and Create account.
- The risk profiler's "A little about you" step now checks its fields:
  full name and investment amount (at least ₹10,000) are required; email,
  mobile and age are optional, and age must be 18–100 if given.

**Download a saved risk proposal**
- Client portal → Risk Profile: "Download proposal (PDF)" and "View
  proposal", plus a PDF link per past assessment. They open
  `/client-portal/risk-report?id=…` (`ClientPortal/RiskReport.jsx`), which
  rebuilds the same 4-page proposal from the saved assessment (same
  `ReportView`, dated the day it was taken) and, with `&print=1`, opens
  the print dialog to save it as a PDF. The client's age is now sent with
  new assessments so it appears on the proposal.

**Portals stay inside the signed-in area**
- Removed the "← rischwealth.com" link from the client and staff portal
  top bars. The sidebar logo now goes to the portal's own home
  (Overview / Dashboard) instead of the website.
- Clients take or retake the risk assessment inside the portal
  (`/client-portal/risk-assessment`, `ClientPortal/RiskAssessment.jsx`):
  `RiskProfiler embedded` hides the site nav and footer, pre-fills the
  client's name, email and mobile, reloads the portal's risk profile once
  saved, and its links go to the portal (risk profile, Messages). Printing
  the proposal from the portal hides the portal chrome. The public
  `/risk-profiler` page is unchanged.

**"Update now" for NAVs on more screens**
- The NAV line with "Update now" (`NavUpdate` in `StaffPortal/common.jsx`)
  is now also on Client portfolios, each client's page and Record a
  purchase, not only the dashboard. After pressing, it says how many funds
  moved to a newer NAV, or that AMFI hasn't published one yet, and the
  page's values reload.

**Staff portal**
- New `/employee-portal` app (`src/pages/StaffPortal/`), same layout and
  styles as the client dashboard. `/employee-login` is now sign-in only
  and sends staff straight to the portal.
- Screens:
  - **Dashboard:** welcome banner, stat cards, recent purchases, pending
    requests, quick actions, NAV update.
  - **Client portfolios:** search and a paginated list with value and
    funds.
  - **Client page:** Overview, Holdings and Transactions tabs. Void is in
    each order's "⋯" menu.
  - **Record a purchase:** pick the client, or start from the client's
    page.
  - **Client requests:** tabs with counts; click a row to read it;
    status changes in the "⋯" menu.
  - **Team accounts** and **Profile & security.**
- Employees see Dashboard, Client requests and Profile only; admins see
  everything (the API enforces the same).
- Phones: a bottom tab bar with a "+" for recording a purchase.
- URLs: `/employee-portal/clients/12/transactions` etc. `docker/nginx.conf`
  serves `employee-portal.html` for every `/employee-portal/` path, and
  `RouteHead` gives them one title.
- The admin panels that were on `/employee-login`
  (`components/admin/ClientOrders.jsx`, Team accounts, request inbox)
  moved into the portal.

**Client dashboard and admin order entry**
- `/client-portal` is now a full dashboard (`src/pages/ClientPortal/`,
  styles in `src/styles/portal.css`) with its own navy sidebar instead
  of the site nav and footer. Screens:
  - **Overview:** greeting, value, invested, XIRR and absolute return,
    allocation donut, top holdings, recent activity, risk profile gauge,
    RISCH team.
  - **Portfolio:** summary, allocation, returns (XIRR) by asset class,
    holdings table with asset-class filters and search.
  - **Transactions:** date and fund filters, 10 per page.
  - **Statements:** valuation and transaction statement (by financial
    year) as CSV downloads; formal statements (CAS, capital gains) are
    requested from the team.
  - **Risk Profile**, **Messages & requests**, **Profile & Security**.
  - One route, `/client-portal/:section?`; each section is prerendered
    (the prerender script now creates sub-folders). The dashboard code
    loads after mount, so it isn't in the public pages' bundle and
    hydration stays clean.
  - Not built yet, so not shown: search, notifications, 2FA, the
    performance chart (needs NAV history to build up).
- `/employee-login` (admins): a **Client portfolios** panel
  (`src/components/admin/ClientOrders.jsx`, also loaded on demand):
  - Pick a client, then record a purchase: fund search (name, AMC,
    scheme code or ISIN), asset class, buying date, amount, buying NAV,
    units (auto), folio, notes.
  - Warns when the buying NAV is far from the fund's current NAV.
  - Order list with Void, NAV status and "Update now".

**Show/hide password**
- `components/PasswordInput.jsx`: password field with an eye toggle
  (accessible label, `aria-pressed`). Used for every password box:
  client sign-in and sign-up, employee sign-in, change password.

**Client portal**
- New `/client-portal` (noindex): signed-in clients land here after
  login (and `/client-login` redirects here if already signed in;
  signed-out visitors are sent to `/client-login`). Cards: Your
  portfolio (Wealth Elite link), Your risk profile (latest saved
  result with allocation bars, or a prompt to take it), Your RISCH
  team, Requests (send a request, see status of recent ones), Your
  details (name, mobile), Security (change password;
  `components/PasswordCard.jsx`, also on the staff page).
- The risk-profiler report says "saved to your client portal" when a
  signed-in client completes it.
- `/employee-login` (signed in): a Client requests inbox for all staff
  (filter, mark in progress, close, reopen), then change password, then
  the admin-only Team accounts panel.

**Client Login page; employee login is sign-in only, with admin panel**
- New `/client-login` (noindex): sign in with email and password; under
  the Login button, "Sign up" (client account form: name, email, mobile,
  password) and "View your portfolio" (opens `FIRM.clientLoginUrl`,
  Wealth Elite). The nav Login menu and footer now point Client Login
  here.
- `/employee-login`: sign-in only (employee ID or email), no public
  sign-up. Admins see a "Team accounts" panel after signing in: create
  employee/admin accounts, reset passwords, disable/activate.
- All account calls are in `src/api/authApi.js`; sessions are httpOnly
  cookies, nothing in browser storage. Styles: `.auth-*`, `.admin-*`.

**Footer: deep navy**
- Footer background changed from charcoal (#1C1A17) to deep private-bank
  navy (#0F1E33), with muted text #A9B1BF and rules #243650 retuned for
  it (contrast: text 13.8:1, muted 7.8:1, orange 6.7:1).

**About: Leadership — Kratika Maheshwari**
- New "Leadership" section on the About page (after Experience):
  Kratika Maheshwari, Co-Founder & Chief Client Experience Officer, with
  portrait (`assets/kratika-maheshwari.jpg`), a tightened bio from the
  supplied copy, prior institutions (HDFC Bank Global Private Clients,
  ICICI Securities Private Wealth, Kotak Securities) and education.
  Added as a `Person` in the schema.org graph. Styles: `.team-*`.

**About: Career Path → Experience**
- Replaced the two-column dated timeline (which listed education as a
  career step, gave junior roles equal weight, and read out of order)
  with a senior-profile layout: heading "Two decades across India's
  leading wealth institutions.", the current role (Founder & CEO, since
  2014) set large, prior roles as a quiet two-column list (most senior
  first, without year ranges), and education on a separate credential
  line. Styles: `.exp-*`.

**CEO's Desk rebuilt to the founder's mockup**
- New office portrait (`assets/founder-office.jpg`, cropped from the
  supplied mockup) in a rounded frame with a captioned name band
  (name + "Founder & CEO, RISCH Wealth" as real text on a dark
  gradient), a faint serif "R" watermark behind it, hanging quote,
  name/title, stewardship paragraph, four quick facts (`CEO_FACTS`:
  years in wealth management, Client-First, India + Global, Built for
  Generations), a dotted career timeline, and a solid "Read the
  founder's story" button. "Independent" from the mockup is shown as
  "Client-First / No product shelf" (distributor registration).
- `founder-portrait.jpg` is no longer used on the home page (About still
  uses `founder-headshot.jpg`).

**CEO's Desk on the page background**
- The section now uses the page background (ivory, or the dark theme's
  background) like "Why RISCH", with a hairline above it, instead of the
  navy band. Text colours come from the theme variables.
- The portrait is a plain 4:5 photo with lightly rounded corners, the
  same layout as before (an arch/keyline frame was tried and removed).
  `height:auto` keeps it 4:5; the img's height attribute was stretching
  it.

**Fourth review (points 4–30): framework, services, proof, type system**
- Home: "Our Approach" became **The RISCH Framework**, a four-stage
  diagram on one rule (`.framework`, stacks vertically on phones):
  Understand Risk, Define the Objective, Build the Allocation (with the
  asset-class chips), Review & Rebalance.
- Services (home + Solutions, `SERVICES` in Solutions.jsx): Portfolio
  Construction, Fund & Strategy Selection, Global Diversification,
  Wealth Coordination. "Private Wealth Solutions" (too generic) is gone.
- Solutions: a "Your portfolio" stacked diagram with no percentages and
  the statement "There is no model portfolio."
- Who We Serve: six premium cards (eyebrow, serif title, description,
  "Start a conversation →", hover lift); segments gained an `eyebrow`.
- "Client Experiences" → "The Client Experience".
- About: new "Built from private banking. Designed around the client."
  story section; the Governance strip adds `FIRM.roleNote`, a plain
  statement that the recommended funds/PMS/AIFs are run by their own
  SEBI-registered managers and RISCH selects, arranges and reviews them.
- Disclosure: now a formal document in six groups (Regulatory
  Information, Risk Disclosure, Methodology, Conflicts of Interest,
  Portfolio Deviation Policy, Important Investor Information) with a
  sticky contents list, continuous clause numbers and smaller type.
- FAQ: added "Can NRIs work with RISCH?".
- "Independent" removed wherever it described the firm (meta
  descriptions, schema, FAQ, About, Disclosure, llms.txt); the principle
  "We're independent-minded." stays.
- Type system per the review: body 16 → 17px / 1.7; serif display
  headings weight 600 → 500; H3 20–24px; eyebrows 12px, 0.14em
  tracking; nav and buttons 14px; section padding 110 → 128px (80px on
  phones).
- Not applied, by decision: olive/bronze palette (brand orange kept);
  Instrument Serif (Cormorant is on the review's own list); nav and
  "Start Risk Profile" CTA changes (the founder chose these); "Founder
  & Private Wealth Advisor" title (Founder & CEO kept).

**Third review: wealth management first, risk profiling as a tool**
- Home: "Our Philosophy — Risk first. Return follows." is replaced by
  "Our Approach — Understand first. Allocate second. Compound over
  time." with four steps (`APPROACH` in Home.jsx): Understand, Construct,
  Monitor, Coordinate. "Construct" lists the actual allocation universe
  (Indian and international equity, fixed income, commodities, real
  estate) rather than the review's "liquidity", which was removed from
  the site earlier.
- The "How We Work With You" 5-step section is removed from the home
  page: sitting right after the new 4-step approach it said the same
  thing twice.
- "Risk Profiling" is no longer one of the four core services (home and
  Solutions). The fourth is "Fund & Strategy Selection": mutual funds,
  PMS and AIFs from across the market, matching the firm's
  registrations. The risk assessment band and nav button stay, as a
  tool.
- Trust bar: "8-point risk diagnostic" becomes "MF · PMS · AIF"
  (`.trust-n-compact` keeps the longer value on one line and aligned).
- FAQ "What does a risk-first approach mean?" becomes "How does RISCH
  build and manage a portfolio?" (also the FAQPage schema). Testimonials
  and Perspective meta descriptions no longer say "risk-first".

**Hero, second review: brand → proposition → credibility → action**
- H1 back to the brand line "Capital deserves a considered hand.", with
  a plain proposition under it ("Private wealth management for
  entrepreneurs, business owners, professionals and families. We manage
  portfolios built around your goals, your risk and your long-term
  wealth, across Indian and global markets.").
- Three credibility points with orange ticks: years of private-banking
  experience (computed from `FIRM.careerStartYear`), open-architecture
  portfolios with no in-house products, Indian & global allocation. The
  review's "Independent portfolio construction" is phrased as
  "open-architecture" for the same distributor-registration reason.
- CTAs: "Start Your Wealth Review" (contact page, which opens on the
  "Portfolio review" topic) and "Meet the Founder" (About). The risk
  profiler stays one click away via the nav's "Start Risk Profile".
- ARN and APRN as fine print under the CTAs; each registration wraps as
  a unit. The tagline "Built around your life…" and the founder
  sentence from the previous version are removed to keep the hierarchy
  tight.
- "We manage portfolios." (from the client brochure) is kept as the
  serif tagline directly under the H1, at the founder's request. Keep it
  in the hero through any future rework. The proposition paragraph no
  longer repeats "We manage portfolios" so it isn't said twice.

**Hero repositioning + typography pass** (from an external site review)
- Hero now answers who / what / for whom / why trust / next step:
  eyebrow "RISCH Private Wealth · Bengaluru · Since 2014"; H1 "Private
  Wealth Management"; tagline "Built around your life, not a product
  shelf."; lede "We manage portfolios for entrepreneurs, business owners,
  professionals, families and global Indians…"; CTAs "Build My
  Portfolio" (risk profiler, primary) and "Speak With RISCH" (contact).
  A credentials block under the CTAs names the founder's background and
  the AMFI ARN / APMI APRN. The review suggested "Independent Wealth
  Management"; "Private" is used instead because the firm is registered
  as a distributor, where "independent" is a sensitive term.
- Home page `<title>`: "RISCH Wealth | Private Wealth Management in
  Bengaluru".
- Type sizes raised for a senior audience: `.body-s` 14.5 → 15.5px
  (cards, process steps, allocation), trust-bar labels 13.5 → 14.5px,
  nav links 13.5 → 14.5px, eyebrows 12.5 → 13px. Principle-card
  headings reduced to 22–27px so the longest wraps to 2–3 lines instead
  of 4. All text measured at ≥ 4.6:1 contrast.

**Brand line, registrations, allocation universe, CEO band**
- "RISCH Wealth & RISCH Family Office" is now "RISCH Private Wealth"
  (home hero eyebrow, footer).
- Registration text (`FIRM.registrationNote`): Mutual Fund Distributor;
  registered with APMI as a Distributor of Portfolio Management Services;
  distributor of Alternative Investment Funds (AIF). Worded so the APMI
  registration is only claimed for PMS distribution. The EUIN is no
  longer shown. AMFI ARN-156886 is listed first, before the APRN.
- Allocation universe (Solutions): domestic equity adds thematic and
  sectoral funds; international adds Taiwan; "Fixed Income & Liquidity"
  is now "Fixed Income"; new Commodities (gold, silver) and Real Estate
  (REITs, InvITs). The same list is updated in the FAQ answer/schema,
  the Portfolio Construction copy and `llms.txt`.
- CEO's Desk band is now a deep navy sampled from the portrait's own
  background, and the photo's edges fade into it, instead of the photo
  sitting as a blue box on warm charcoal.

**Logo ring (Three.js)**
- Behind the RISCH wordmark in the nav: the single large ring from the
  brochure cover (4 segments, the brochure's tones), sized so the whole
  104x32 wordmark sits inside it (116px; 102px on phones), spinning
  clockwise about its centre, one revolution per 36 s.
- `components/LogoRing/`: `ringGeometry.js` is the single source of the
  shape (segment angles, inner radius, parallel-sided gaps) for both the
  SVG and the Three.js mesh; `logoRingScene.js` is the Three.js scene
  (orthographic camera, `ShapeGeometry` per segment, colours and
  per-tone opacity read from the `--lr-*` CSS variables, so light/dark
  are set in `styles.css` and update live on theme change);
  `LogoRing.jsx` handles loading and the hand-off.
- Loading: the SVG is prerendered and spins with CSS from first paint.
  4 s after the load event (then on idle), `three` is fetched as its own
  chunk (~137 KB gzip) and the WebGL canvas cross-fades in at exactly the
  CSS animation's current angle, then the SVG animation is paused. This
  keeps Three.js out of the critical path: Lighthouse performance stays
  at 98 (it was 84 when Three.js loaded on first idle).
- Fallbacks: no WebGL, or the chunk fails to load, and the CSS spin just
  carries on. With `prefers-reduced-motion` the ring is still and
  Three.js is never downloaded.
- The wordmark gets a hairline halo in the page colour
  (`drop-shadow`) so every letter stays crisp over any segment.
- Header geometry is now variables in `:root`: `--nav-h` 124px
  (108px on phones), `--nav-h-scrolled` 94px (84px), `--logo-h`,
  `--ring-d`, `--logo-scrolled-scale`. On scroll the header compacts and
  the logo and ring scale down together. The hero, `.page-head`, and the
  risk profiler's progress rail and content offsets are derived from
  `--nav-h` rather than hard-coded.
- Replaces an earlier attempt (a small rotated crop of the rings beside
  the wordmark), which was removed.

**Registration, founder portrait, business-card details**
- Regulatory standing from the APMI emails (June 2025): RISCH Wealth
  Private Limited is registered with APMI as a Distributor of Portfolio
  Management Services, APRN05916; the founder's EUIN is E11449 (valid
  24/05/2025 – 23/05/2028, renew before expiry). Held in
  `FIRM.registrationNote` / `FIRM.registrations`, shown in the footer on
  every page, as the second clause on the Disclosure page, on the About
  page (Governance & Standing) and on the Contact page. CIN and AMFI ARN
  slots are noted in `firm.js` for when they're supplied.
- Office address now matches the business card exactly (Brigade Exotica,
  Tower Azure, No 35 & 36/1, P, Old Madras Road (Before Budigere Cross),
  Bengaluru 560049), stored as display lines in `FIRM.address.lines`.
- The second phone number is switched off (`FIRM.phoneAlt: null`):
  current materials only list +91 94480 90998.
- New founder portrait cropped from the business card
  (`assets/founder-portrait.jpg`, 4:5, and `founder-headshot.jpg` for the
  About page avatar). The old `ceo-photo.jpg` is removed.
- Home: the founder section is now "From the CEO's Desk", a charcoal
  band like the footer and brochures, with the founder's quote from the
  brochures and the stewardship paragraph, plus the career summary.
- Footer rebuilt: brochure line "Private Wealth. Family Capital.
  Enduring Legacies.", an Office column with the address, a registration
  band (note + APRN + EUIN), and the "Trust. Discipline. Performance."
  motto.
- Who We Serve ends with the brochure line "Every relationship is built
  on trust. Every strategy is built for the long term."
- Not used from the new brochure drafts: the service list (Investment
  Advisory, Tax & Structuring, etc.) and "Independent & Unbiased
  Advice", pending a compliance view given the distributor registration.

**Client brochure content (RISCH Wealth & RISCH Family Office)**
- Hero is now two columns: copy on the left, and on the right the
  overlapping "portfolio rings" from the brochure cover, redrawn as SVG
  (`components/PortfolioRings.jsx`). It's one orange at graded
  opacities, so overlaps blend as in print, it's sharp at any size and
  it adapts to dark mode. The eyebrow is now "RISCH Wealth & RISCH
  Family Office", and "We manage portfolios." sits under the headline.
  The old decorative wave graph is gone; the rings replace it.
- The featured principles section is now headed by the brochure's
  mission: "Our Mission — Investor Success" / "Investors trust us
  because we put them first."
- Contact details from the brochure: the full office address and a
  second phone number (+91 94830 03456, which also matches the Google
  Business Profile) are in `FIRM.address` / `FIRM.phoneAlt`, shown on the
  contact page and in the footer, and emitted in schema.org
  (`streetAddress`, `postalCode`, `contactPoint`).
- Contact page intro uses the brochure's "We have a dedicated support
  team."
- Footer disclaimer starts with the standard mutual fund line, and the
  Disclosure page has a new "Mutual fund risk disclosure" clause, both
  taken from the brochure's disclaimer.
- Not used on purpose: the two Morningstar brochures (marked "For
  Investment Adviser Use Only", with a no-redistribution notice), and
  the brochure's page-2 copy ("Great investing makes everyone shine",
  "The time for great investing is now", the seven values), which is
  Morningstar's published wording.

**Investment principles (client brochure)**
- Added an "Our Investment Principles" section to the Solutions page,
  between the four disciplines and the allocation universe: RISCH's own
  seven-principle client brochure ("We put investors first", "We're
  independent-minded", "We invest for the long term", "We're
  valuation-driven investors", "We take a fundamental approach", "We
  strive to minimise costs", "We build portfolios holistically"), each
  with a small stroke icon, in the same card grid as the allocation
  universe below it. Titles and copy are the firm's own text
  (light copy-edits only), not written for this redesign. The data now
  lives in `src/data/principles.jsx` (icon + title + body), shared with
  the home page hero below.
- Home page: the seven principles now get the most prominent section
  on the site, their own tinted band directly after the hero — before
  the trust bar, before everything else — as a bold 4-column card grid
  (icon, large serif number, heading, body), 3 columns down to ~1180px,
  2 down to ~860px, 1 on phones. An earlier version crammed the titles
  into a right-aligned sidebar list next to the hero headline; that
  looked cramped and was replaced with this. The hero itself is back to
  its original single-column layout. The decorative wave graph under the
  hero is slightly shorter (viewBox height 300 → 220, same curve, just
  compressed) to tighten the space above the new section.
- The full principles data (icon + title + body) now lives in
  `src/data/principles.jsx`, shared between this new home page section
  and the Solutions page's own (smaller) version.
- The Allocation Universe section lost its `on-dark`/tint background
  (it would otherwise sit directly against the new tinted Investment
  Principles section with no visual break) and its icons dropped the
  now-redundant `icon-badge-dark` modifier.

**Private-wealth redesign**
- New design system (see "Design system"): ivory default theme, charcoal
  primary buttons, the orange as a restrained accent, Cormorant Garamond
  display headings, squared buttons, flat cards. Replaces the previous
  "consumer fintech" look. Accessibility is 95 → 100.
- Home page rebuilt around a private-wealth story: trust bar, 5-step
  "How we work with you", four client profiles, four disciplines, "Why
  RISCH", founder section with career summary, and a closing
  consultation CTA. The allocation-universe ticker was removed.
- The main CTA on inner pages/sections is "Start a conversation"
  (`/contact`); the risk profiler is offered as a secondary action
  ("Take the risk assessment"). The nav's top-right button is the
  exception: it stays "Start Risk Profile" → `/risk-profiler`, so it
  doesn't duplicate the "Contact" nav link next to it.
- Nav: The Firm, Who We Serve, Solutions, Testimonials, Perspective,
  Disclosure, Contact (7 links). Fits down to ~1180px before the burger
  (was 1400px in the previous design).
- Kept the Login dropdown ("Login ▾" → Client Login / Employee Login),
  restyled for the new design system (squared corners, ivory/charcoal).
  The footer also keeps a small "Employee sign-in" link as a second way in.
- Disclosure page rewritten as 12 numbered clauses (same numbered-row
  pattern as the home page's philosophy section): purpose, entity,
  regulatory compliance, risk assessment methodology, its limits,
  independence, deviation policy, no advice/no endorsement, risk
  warning, no guarantee of returns, confidentiality, trademarks, and
  contact. The regulatory-compliance and no-advice/no-endorsement
  clauses are drawn from RISCH's own client brochure ("Investment
  Principles"), not written for this redesign. Regulatory registration
  and grievance rows appear automatically once `FIRM.registrations` /
  `FIRM.grievance` are filled in — nothing is invented ahead of that.
- New charcoal footer: legal entity, location, link columns, registration
  line (from `firm.js`), disclaimer.
- `src/data/firm.js` holds firm facts; `src/data/segments.jsx` holds the
  client profiles shared by two pages.
- Contact page: the "design preview" message is gone. The form now opens
  a pre-filled email to `FIRM.email`, and "Portfolio review" was added as
  a topic.
- `contact@rischwealth.com` (used on Disclosure and in the profiler
  footer) replaced with `FIRM.email`. The domain has no MX records yet,
  so that address bounced.
- Risk profiler: the intro now says "preliminary proposal". The result
  screen shows a "preliminary assessment, not a final investment
  recommendation" notice, with "Discuss this with RISCH" as the primary
  action.
- Copy: removed "more than two decades" / "20+ years" from the FAQ, the
  About meta description and `llms.txt`. The About timeline (career from
  2006, RISCH from 2014) doesn't support it. The trust bar computes the
  career length from `FIRM.careerStartYear`.
- New share image (`public/og-image.png`) in the new design.

**SEO audit fixes** (from the rischwealth.com SEO audit report)
- Prerendering of every route + hydration (was a client-only SPA:
  crawlers saw an empty `<div id="root">`).
- Per-page titles/descriptions/canonicals, Open Graph + X cards,
  schema.org JSON-LD, `sitemap.xml`, real `robots.txt` and `llms.txt`
  (before this, those three URLs returned the homepage HTML).
- Home-page FAQ section (7 questions) + FAQPage schema.
- Heading structure: one `<h1>` per page and no skipped levels. Footer
  column labels `h5` → `h2`, and card titles directly under a page `<h1>`
  `h3`/`h4` → `h2`/`h3`. Visual styling is unchanged.
- Risk profiler shows its intro (with Begin disabled) while the question
  bank loads, instead of a bare "Loading…".
- Real 404 page and status for unknown URLs (was the homepage with 200).
- gzip, cache headers, trailing-slash redirect in `docker/nginx.conf`.
- Self-hosted Inter font, optimised logo, new favicons, share image.
- Fixed phones showing two squeezed columns wherever a `.g-2` grid set
  its columns inline (the mobile breakpoint now uses `!important`).
- Removed an invalid `height="auto"` on the home-page SVG (console error).
- Replaced the per-page `useDocumentHead` hook with `seo.js` + `RouteHead`.

**Login menu**
- Nav "Client Login" link → "Login ▾" dropdown (hover or click; closes on
  outside click or Escape) with Client Login (Wealth Elite, new tab) and
  Employee Login (`/employee-login`). The mobile menu lists both links.

**Nav**
- Removed the "Risk Profiler" nav tab, since the "Start Risk Profile"
  button already links there. The footer link remains.

**What We Provide: hero and 01 / Understand**
- Hero: masthead-style kicker ("What We Provide ... Est. 2014"), hand-set
  italic "Portfolio second.", shorter lede, plain "Explore the architecture".
- 01 / Understand now has two parts: Risk Tolerance (was Risk capacity) and
  Time Horizon, with one horizon per portfolio: Risch Conservative up to 5
  years, Balanced 5 to 7, Moderate 7 to 10, Aggressive 10+. Liquidity,
  Objectives, Existing wealth and Concentration removed from this section.
- No em-dashes anywhere in site text (code comments excepted). Empty-value
  placeholders in tables are now an en-dash; backend portfolio labels read
  "Portfolio 1: Conservative" etc.
- Hero: removed the "Start Your Risk Profile" / "Review Risk Profile" button
  (the nav button and the later sections keep theirs). Added depth: the
  composition turns in CSS 3D with the pointer (desktop only, off for touch
  and reduced motion) with a slow idle sway and a soft floor shadow; inside
  the three.js scene the rings now sit at different depths and the outer
  nodes are lifted forward, so they separate as it turns.
- Hero: dropped "Est. 2014" and its rule from the kicker. The diagram now
  has only two rings, Risk Tolerance and Time Horizon (matching 01 /
  Understand); Liquidity, Objectives and Existing wealth rings are gone.
  The rings precess on their own axes inside the three.js scene.
- 01 / Understand: removed the "Start Risk Profile" button from this
  section too (the hero, nav and later sections keep theirs); "Eight
  questions · about three minutes" remains as a plain line.

**What We Provide: full redesign (Oct 2026)**
- New order: dark hero with an interactive 3D orrery, 1 Understand, 2 Asset
  Allocation, 3 Investment Philosophy (dark), 4 How it comes together,
  dark closing CTA. All copy is in `src/content/solutions.js`; lines
  marked COMPLIANCE are the regulatory-sensitive ones. Styles are in
  `src/styles/solutions.css`.
- Orrery (`components/solutions/Orrery.jsx`, `orrery3d.js`): "You" core,
  Risk Tolerance and Time Horizon rings, outer orbit of the six asset
  classes. Drag or arrow keys to turn it, click or press a name to bring a
  sphere forward. Names are real buttons. SVG fallback on weak phones, no
  WebGL; reduced motion stops the auto-orbit.
- Understand: Risk Tolerance (psychometric copy, Morningstar "Mind the Gap"
  figure with source, Graham quote) and Time Horizon (slider + four rows,
  kept in step). Boundaries: up to 5 / over 5 to 7 / over 7 to under 10 /
  10+.
- Asset Allocation: four portfolio tabs with a 3D donut (SVG fallback).
  The percentages are PLACEHOLDERS (`ILLUSTRATIVE_ALLOCATIONS`, TODO owner
  to confirm), labelled "Illustrative".
- The Morningstar-worded principles are gone from this page (still on Home).
  Removed: Architecture/ModuleList, portfolio-experience adaptation,
  old hero scene.
- The Morningstar statistic uses the verified figures (10 years to 31 Dec
  2025: funds 9.9%, investors 8.7%, gap 1.2 points), not the brief's.
- /solutions now uses the same ground as Get In Touch and Testimonials
  (ivory, sand wash, paper grain, faint orange arcs) in hero, philosophy
  (sand) and closing CTA; the green/dark bands are gone. The orrery is
  ink spheres with an orange halo and follows the light/dark theme;
  buttons use the site's standard primary/secondary styles.
- /solutions: removed every "Start risk profile" / "Review risk profile"
  button from the page body (hero, Understand, closing CTA; the nav button
  stays). The closing CTA now has only "Get in touch". The hero orrery
  drops Liquidity, Real Estate and Commodities, leaving Risk Tolerance,
  Time Horizon, Domestic Equity, International Equity and Fixed Income.
- /solutions: after the risk-profile button removals the page was rebalanced:
  the hero's remaining action is an outline "See how we decide" button with
  a down arrow (was a bare text link), and the orphaned "Eight questions,
  about three minutes" line under Time Horizon is gone.
- /solutions section 3 reworked: the five invented principles are replaced
  by the original seven (data/principles.jsx) as a scroll-morph again
  (`components/solutions/PrinciplesMorph.jsx`, rebuilt without
  framer-motion, CSS transitions only): seven flip cards scatter, line up,
  form a circle, then open into an arc as you scroll; hover, focus or tap
  turns a card over. The heading and Test-match quote now sit side by side
  and are pinned with the cards, which removes the large empty gap. Phones
  and reduced-motion get a plain numbered list.
- Hero orrery: the three rings now lean at their own angles and precess
  like gyroscopes (and the whole system turns faster), so the rings visibly
  rotate in 3D and cross each other. Choosing a sphere stops the precession
  and turns the system until that sphere faces you. Load errors are now
  logged to the console (they were swallowed before).
- /solutions: the four disciplines are now a 3D ring of cards
  (`components/solutions/RingSlider.jsx`, plain CSS 3D, no library). Drag
  or use the arrow keys / buttons to turn it; it drifts slowly on its own
  (paused on hover, focus, off screen and with reduced motion). Cards
  facing away are dimmed and inert. Under 760px wide it falls back to the
  plain four-column / stacked list. Each card keeps its "Discuss this"
  link to /contact?topic=...
- /solutions: removed the "Morningstar, Mind the Gap" source line under the
  1.2% figure (owner's request). The statistic itself is still shown.
- /solutions allocation: the portfolios now show four asset classes
  (Domestic Equity, International Equity, Fixed Income, Commodities);
  Liquidity and Real Estate removed from the mixes (placeholder percentages
  re-based to 100, still TODO owner to confirm). The 3D donut highlights the
  segment under the pointer (it steps forward and grows, the legend row and a
  centre label follow); hovering a legend row highlights its segment too.
  The flat SVG fallback highlights on hover as well. Liquidity and Real
  Estate remain in the "building blocks" list further down.
- /solutions hero: the black-hole experiment was reverted at the owner's request; the gyroscope-ring orrery is back as before.
- /solutions hero orrery re-done as a live 3D projection onto SVG
  (`components/solutions/Orrery.jsx`, plain maths, no WebGL, so it works on
  every browser and phone; the three.js orrery file is removed, three.js
  stays for the allocation donut). The rings lean and precess, the spheres
  shade and scale with depth, and the name labels swing round with their
  spheres (turned and scaled in perspective, dimmer at the back). Drag or
  arrow keys to turn; choosing a name brings its sphere to the front;
  reduced motion shows a still frame.
- /solutions: tightened vertical spacing across the page. Section padding
  is roughly halved (about 44 to 80px instead of 72 to 150px), the gaps
  between a heading, its content, the disclaimers, the process timeline and
  the disciplines ring are smaller, and the principles stage now starts right
  under the nav with no blank band above the heading (its circle is a little
  smaller so it stays clear of the heading and quote).
- /solutions allocation chart: hover now works on the flat (non-WebGL)
  donut too. The segment under the pointer thickens and casts a shadow, the
  others fade, the legend row and centre label follow. Cause of the bug: the
  empty 3D canvas sat on top of the flat chart and swallowed the pointer, so
  it now ignores the pointer until the 3D chart is actually running. The 3D
  chart's hover is unchanged.
- /solutions: removed Liquidity and Real Estate from the "building blocks"
  list (seven blocks remain).
- /solutions hero: removed the "Drag to turn it. Select any sphere to bring it
  forward." hint line; the panel under the orrery stays empty (its rule
  hidden) until a name is chosen.
- /solutions: shortened the blank band under the hero (hero bottom padding
  about 14 to 24px, Understand top padding about 36 to 60px, smaller reserved
  panel under the orrery).
- /solutions: removed the closing "A portfolio built around your life" band
  (and its Get in touch button). The line now sits, in italic accent serif,
  on the right of the "Four disciplines. One coherent portfolio." heading;
  the page ends with the disciplines ring and then the footer.
- /solutions allocation: the four portfolios are now the RISCH model
  mandates, named "Risch Active Balanced", "Risch Active Growth", "Risch Active
  Aggressive" and "Risch Active Aggressive Plus", with the macro allocation
  and the sub-asset class breakdown shown as two donuts (3D with hover, flat
  fallback) and legends, using the same percentages as the risk profiler
  (be/src/riskProfiler/config.js TIERS + SPLIT; derived in
  content/solutions.js, keep them in step). Aggressive Plus carries the
  profiler's domestic-concentration note and has no international rows. The
  Time Horizon rows now use the same names, in the same order: Active
  Balanced up to 5 years, Growth 5 to 7, Aggressive 7 to 10, Aggressive Plus
  10+ (previously Conservative / Balanced / Moderate / Aggressive). The
  placeholder illustrative mixes are gone.
- /solutions: portfolio names are written "RISCH Active ..." (RISCH always in capitals).
- /solutions "The wealth architecture": the card ring of the four disciplines
  (RingSlider, deleted) is replaced by a quiet piece of linework
  (`components/solutions/WealthArchitecture.jsx` + `architecture3d.js`,
  three.js): a calm core labelled "One portfolio" and four open hairline
  layers, one per discipline (existing names), each ending in a small node.
  Ink linework on the page ground (follows light/dark), orange only for the
  active layer. About 78 s per turn, pointer parallax within 3 and 2 degrees,
  and the layers ease toward one plane as the section scrolls into view.
  Hover, focus or tap a label to highlight its layer and read one line plus
  the "Discuss this" link. DOM labels, DPR capped at 1.5, paused off screen,
  everything disposed on unmount. Phones and no-WebGL get a still drawing and
  the plain four-item list; reduced motion stops the turning, parallax and
  scroll convergence. Hero copy and the hero orrery are untouched.
- /solutions principles cards: the dark charcoal cards are now light, in the
  style of the Testimonials and Get In Touch cards: white surface, hairline
  border, orange top rule, ink serif titles and orange numbers; the back face
  is a soft ivory with the same rule. Both follow the light/dark theme.
- /solutions: the Understand heading now reads "Before we design a portfolio,
  we understand you." The "building blocks" list is now "Solutions" with
  three items only (Mutual Fund, Portfolio Management Services (PMS),
  Alternative Investment Funds (AIF)); same hover/tap effect. Meta
  description wording updated to match.
- /solutions Understand: now three points side by side, Risk Tolerance,
  Time Horizon and Behavioural Science (new). The behavioural-patterns copy
  moved from Risk Tolerance into Behavioural Science, which also carries the
  1.2% figure and the Graham quote; the intro and the horizon note say
  "three things" / "three inputs". The portfolio rows stack name over years in
  the narrower column. Two columns under 1020px, one under 760px.
- /solutions: the process heading now reads "How a RISCH portfolio comes together."
- /solutions: the disciplines section is back to the 3D ring of four cards
  (RingSlider), replacing the "wealth architecture" linework (removed).
  Drag, arrow keys or buttons turn it; it drifts slowly; cards facing away
  are dimmed and inert; under 760px it is the plain list.
- /solutions allocation donuts: new colour scheme so every slice is easy to tell apart. Hue marks the asset family (rust and orange for India equity, navy and blue for international equity, green for fixed income, warm grey for cash) and shade separates the slices inside a family. Legends use the same colours.
- /solutions Time Horizon: removed the repeated four-portfolio list. Under the
  slider there is now a "Likely fit" line (portfolio name, fades on change) and
  a "See this mix below" link that smooth-scrolls to Asset Allocation, clear of
  the sticky header. The slider drives the Asset Allocation tab (one way; tab
  clicks never move the slider). Mapping, in `horizonForYears`: up to 5 years
  Balanced, 6 to 7 Growth, 8 to 10 Aggressive, 11 and up Aggressive Plus.
- /solutions imagery and icons: thin line icons (inline SVG, Lucide-style, accent colour,
  decorative) on the Risk Tolerance / Time Horizon / Behavioural Science cards, the four
  process steps and the three Solutions items; eyebrow labels with a rule each side (YOUR
  PROFILE, OUR PRINCIPLES, OUR PROCESS, WHAT WE OFFER); a full-width photo band above the
  principles and a closing "Start with your risk." band with a Start Risk Profile button
  (`components/solutions/Band.jsx`). Images are placeholders in
  `public/images/solutions/` (see the README there); a neutral block shows if one is missing.
- /solutions: removed the empty photo band above the principles (its placeholder file is deleted and a photo band with no image now takes no space). Add `public/images/solutions/principles-band.webp` to bring it back.
- /solutions hero visual replaced: the orbit diagram is gone
  (`Orrery.jsx`, `orreryLayout.js` and the `or-*` CSS deleted). New
  "profile to portfolio" diagram (`components/solutions/ProfileToPortfolio.jsx`,
  plain SVG + DOM labels, no WebGL): Risk Tolerance, Time Horizon and
  Behavioural Profile draw toward "You", then open into Domestic Equity,
  International Equity and Fixed Income under a "Portfolio architecture" label.
  Intro draws once (about 2 s), slow idle drift, 2 degree pointer depth on
  desktop only; reduced motion shows the finished drawing; phones get a
  vertical version of the same sequence. Hero copy and CTA ("Explore our
  approach") updated to the new wording. No allocation figures.
- /solutions Understand cards: the supporting text under the 1.2% figure, the
  Time Horizon note and the quote attribution now use the same body style and
  size as the card paragraphs (17 to 19px, ink-2). Headings, the large figure
  and the quote itself are unchanged.
- /solutions Understand cards: body text a little smaller (16px, notes and captions 15.5px), and the 1.2% figure has its caption beside it again instead of below.
