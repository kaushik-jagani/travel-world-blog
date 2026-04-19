# Real Estate World — Full Project Documentation

> Complete developer guide for understanding, maintaining, and extending the Real Estate World blog.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Folder Structure (Complete)](#2-folder-structure-complete)
3. [How the Site Works](#3-how-the-site-works)
4. [Adding a New Blog Post](#4-adding-a-new-blog-post)
5. [Post JSON Schema Reference](#5-post-json-schema-reference)
6. [Section Types Reference](#6-section-types-reference)
7. [Index.json — Central Post Registry](#7-indexjson--central-post-registry)
8. [Page-by-Page Breakdown](#8-page-by-page-breakdown)
9. [Clean URL System](#9-clean-url-system)
10. [CSS Architecture](#10-css-architecture)
11. [JavaScript Architecture](#11-javascript-architecture)
12. [Dark Mode System](#12-dark-mode-system)
13. [Search Functionality](#13-search-functionality)
14. [Sidebar System](#14-sidebar-system)
15. [AdSense Compliance](#15-adsense-compliance)
16. [SEO & Meta Tags](#16-seo--meta-tags)
17. [Scaling to 11k+ Posts](#17-scaling-to-11k-posts)
18. [Common Mistakes to Avoid](#18-common-mistakes-to-avoid)
19. [Deployment Checklist](#19-deployment-checklist)
20. [Creating a Similar Site from Scratch](#20-creating-a-similar-site-from-scratch)

---

## 1. Project Architecture

Real Estate World is a **static blog** built with pure HTML, CSS, and vanilla JavaScript (no frameworks, no build tools). Content is stored as JSON files and rendered client-side at runtime.

### Key architectural decisions:
- **No server-side rendering** — everything is static HTML + client-side JS
- **JSON-driven content** — each blog post is a `post.json` file
- **Central index** — `data/posts/index.json` is a flat array of all post metadata, fetched once
- **Clean URLs** — achieved via `.htaccess` (Apache) + `_redirects` (Netlify) + physical `index.html` copies for local dev
- **Scalable** — designed to handle 11,000+ posts without performance issues

### Data flow:
```
User visits /blog/some-slug
  → Netlify serves pages/blog-post.html via _redirects rewrite
    (or locally: blog/some-slug/index.html loads)
  → router.js extracts slug from URL path
  → Fetches /data/posts/index.json (all post metadata, one request)
  → Fetches /data/posts/some-slug/post.json (full content)
  → render.js builds the article HTML from sections array
  → Sidebar populated from index.json (no extra fetches)
```

---

## 2. Folder Structure (Complete)

```
d:\Blog\DK\ProperiesGroup\
│
├── index.html                          ← HOME PAGE: hero, recent posts
├── .htaccess                           ← Apache rewrite rules for clean URLs
├── _redirects                          ← Netlify rewrite rules (dynamic blog routing)
├── claude.md                           ← AI assistant reference (read before any work)
│
├── docs/
│   └── PROJECT-GUIDE.md                ← THIS FILE — full documentation
│
├── assets/
│   ├── css/
│   │   ├── base.css                    ← CSS reset, variables, typography, utility classes
│   │   ├── header.css                  ← Sticky header, navigation, search box, hamburger
│   │   ├── article.css                 ← Blog post page: 3-column grid, TOC, content
│   │   ├── sidebar.css                 ← Right sidebar cards, trending reads
│   │   ├── blog-list.css               ← Blog listing: hero, featured post, cards grid, pagination
│   │   └── dark-mode.css               ← [data-theme="dark"] overrides
│   │
│   ├── js/
│   │   ├── theme.js                    ← Dark/light toggle, localStorage persistence
│   │   ├── render.js                   ← Converts post.json sections → HTML
│   │   ├── router.js                   ← URL slug extraction, post loading, sidebar
│   │   └── header.js                   ← Hamburger menu, search toggle, mobile drawer
│   │
│   ├── icons/
│   │   └── favicon.svg
│   │
│   └── images/
│       └── posts/
│           └── [slug]/                 ← One folder per post
│               ├── cover.jpg           ← Cover/hero image
│               └── [other].jpg         ← Section images referenced in post.json
│
├── data/
│   ├── site-config.json                ← Global settings (site name, GA ID, etc.)
│   └── posts/
│       ├── index.json                  ← ⭐ CENTRAL INDEX: array of all post metadata
│       └── [slug]/
│           └── post.json               ← Full post content (meta + sections)
│
├── pages/                              ← ⭐ SOURCE FILES — always edit these
│   ├── blog-list.html                  ← Blog listing page (/blog)
│   ├── blog-post.html                  ← Blog post template (/blog/[slug])
│   ├── about.html                      ← About page (/about)
│   ├── contact.html                    ← Contact page (/contact)
│   ├── disclaimer.html                 ← Disclaimer (/disclaimer)
│   └── privacy-policy.html             ← Privacy policy (/privacy-policy)
│
├── blog/                               ← Clean URL copies (auto-synced from pages/)
│   ├── index.html                      ← ← Copy of pages/blog-list.html
│   └── [slug]/
│       └── index.html                  ← ← Copy of pages/blog-post.html
│
├── about/index.html                    ← Copy of pages/about.html
├── contact/index.html                  ← Copy of pages/contact.html
├── disclaimer/index.html               ← Copy of pages/disclaimer.html
├── privacy-policy/index.html           ← Copy of pages/privacy-policy.html
│
└── components/                         ← Reference HTML snippets (not loaded at runtime)
    ├── header.html
    ├── footer.html
    └── post-card.html
```

---

## 3. How the Site Works

### Home page (`/`)
- Static HTML with inline JS
- Fetches `index.json`, sorts by date, renders up to 6 recent post cards
- Links to `/blog` for full listing

### Blog listing (`/blog`)
- Fetches `index.json` (single request)
- Sorts posts by date descending
- Shows featured post (first with `featured: true`)
- Displays remaining posts in a 3-column grid
- "Load More" button paginates 6 posts at a time
- Search input filters posts client-side by title

### Blog post (`/blog/[slug]`)
- `router.js` extracts slug from `window.location.pathname`
- Fetches `index.json` (for sidebar) and `data/posts/[slug]/post.json` (for content)
- `render.js` converts the `sections[]` array into HTML
- 3-column layout: TOC (left) | Article (center) | Sidebar (right)
- Sidebar shows "Trending Reads" from other posts in `index.json`
- "You May Also Like" section shows 3 other posts

---

## 4. Adding a New Blog Post

### 2-Minute Process:

**Step 1:** Create the post data folder:
```
data/posts/your-new-slug/post.json
```

**Step 2:** Add entry to `data/posts/index.json`:
```json
{
  "id": 5,
  "slug": "your-new-slug",
  "title": "Your Post Title",
  "author": "Admin",
  "date": "2026-04-20",
  "readTime": "6 min read",
  "category": "Real Estate",
  "excerpt": "A short description of the post for cards and SEO...",
  "coverImage": "/assets/images/posts/your-new-slug/cover.jpg",
  "featured": false
}
```

**Step 3:** Create the clean URL folder (**local dev only** — on Netlify, `_redirects` handles this automatically):
```powershell
# Create folder
New-Item -ItemType Directory -Path "blog\your-new-slug" -Force

# Copy template
Copy-Item "pages\blog-post.html" "blog\your-new-slug\index.html" -Force
```

**Step 4 (optional):** Add cover image:
```
assets/images/posts/your-new-slug/cover.jpg
```
Or use an Unsplash URL in the `coverImage` field.

**Step 5:** Visit `http://127.0.0.1:5500/blog/your-new-slug/` — done!

### What happens automatically:
- Home page shows the post in "Recent Articles" (if in top 6 by date)
- Blog listing page shows it in the grid
- Other blog posts show it in the sidebar ("Trending Reads")
- "You May Also Like" section includes it
- Search finds it by title

### What you do NOT need to edit:
- No JS changes
- No CSS changes
- No HTML template changes
- No router configuration

---

## 5. Post JSON Schema Reference

```json
{
  "slug": "string — URL-safe identifier, matches folder name",
  "url": "string — full canonical URL",
  "title": "string — main heading",
  "author": "string — author display name",
  "date": "string — YYYY-MM-DD format",
  "readTime": "string — e.g. '8 min read'",
  "category": "string — always 'Real Estate'",
  "coverImage": "string — absolute URL or path starting with /",

  "meta": {
    "title": "string — SEO <title> tag",
    "description": "string — meta description",
    "keywords": ["array", "of", "strings"],
    "robots": "string — 'index, follow'"
  },

  "openGraph": {
    "type": "article",
    "title": "string",
    "description": "string",
    "url": "string",
    "site_name": "Real Estate World",
    "image": "string — URL",
    "locale": "en_US"
  },

  "twitter": {
    "card": "summary_large_image",
    "title": "string",
    "description": "string",
    "image": "string — URL"
  },

  "sections": [
    "← Array of section objects (see Section Types below)"
  ]
}
```

---

## 6. Section Types Reference

Each object in the `sections[]` array can have one or more of these properties:

### Paragraph
```json
{ "heading": "Section Title", "content": "Paragraph text here." }
```

### Bullet list
```json
{ "heading": "Section Title", "list": ["Item 1", "Item 2", "Item 3"] }
```

### Subsections
```json
{
  "heading": "Parent Section",
  "subsections": [
    { "title": "Sub Title 1", "content": "Text..." },
    { "title": "Sub Title 2", "list": ["item a", "item b"] }
  ]
}
```

### FAQs (collapsible accordion)
```json
{
  "heading": "Frequently Asked Questions",
  "faqs": [
    { "question": "What is...?", "answer": "It is..." },
    { "question": "How to...?", "answer": "You can..." }
  ]
}
```

### Table
```json
{
  "heading": "Comparison",
  "table": {
    "headers": ["Column 1", "Column 2"],
    "rows": [
      ["Cell 1", "Cell 2"],
      ["Cell 3", "Cell 4"]
    ]
  }
}
```

### Quote
```json
{ "heading": "Expert Opinion", "quote": "The market is evolving rapidly..." }
```

### Callout box
```json
{ "heading": "Note", "callout": "Important: Always verify with local authorities." }
```

### Image
```json
{ "heading": "Section Title", "image": "/assets/images/posts/slug/photo.jpg" }
```

### Combined (paragraph + list + image in one section)
```json
{
  "heading": "Section Title",
  "content": "Intro text...",
  "image": "/assets/images/posts/slug/photo.jpg",
  "list": ["Point 1", "Point 2"]
}
```

---

## 7. Index.json — Central Post Registry

**File:** `data/posts/index.json`

This file is a **flat JSON array** containing metadata for every published post. It is fetched once by:
- Home page (recent articles)
- Blog listing page (full grid)
- Blog post page (sidebar + "You May Also Like")

### Format:
```json
[
  {
    "id": 1,
    "slug": "luxury-apartments-dubai-guide",
    "title": "Luxury Apartments in Dubai: Smart Guide for Modern Buyers (2026)",
    "author": "Sarah Mitchell",
    "date": "2026-04-18",
    "readTime": "8 min read",
    "category": "Real Estate",
    "excerpt": "Dubai has become one of the top cities for luxury apartment living...",
    "coverImage": "/assets/images/posts/luxury-apartments-dubai-guide/cover.jpg",
    "featured": true
  }
]
```

### Rules:
- Must be valid JSON — use double quotes, no trailing commas
- Use **plain apostrophes** in strings, not escaped `\'`
- `id` must be an incremental integer — next post gets `max(id) + 1`
- `slug` must match the folder name in `data/posts/[slug]/`
- `date` in `YYYY-MM-DD` format for proper sorting
- Sort order: `date` descending, then `id` descending (tiebreaker for same-day posts)
- `featured: true` on at most one post (shown as hero card on blog listing)
- `coverImage` should start with `/` (absolute from root)

---

## 8. Page-by-Page Breakdown

### `index.html` (Home — `/`)
- Hero section with CTA → `/blog`
- Recent articles grid (6 posts from index.json)

### `pages/blog-list.html` (Blog — `/blog`)
- Hero with title + tagline
- Featured post (large card with overlay)
- Posts grid (3-col, paginated with "Load More")
- Search functionality
- Fetches `index.json` once, sorts by date desc

### `pages/blog-post.html` (Article — `/blog/[slug]`)
- Breadcrumb: Home > Real Estate > [Post Title]
- Cover image
- Title, author avatar, date, read time
- Social share buttons (X, Facebook, LinkedIn, Copy)
- 3-column grid: TOC (left sticky) | Content (center) | Sidebar (right sticky)
- "You May Also Like" section (3 cards)
- Uses `router.js` + `render.js`

### `pages/about.html` (`/about`)
- Hero section
- "Who We Are" — blog description (NOT a property agency)
- Stats row (articles, cities, readers, years)
- Editorial values (3 cards)

### `pages/contact.html` (`/contact`)
- Hero section
- Contact info cards (email, what we help with, partnerships, disclaimer about not selling)
- Contact form (name, email, subject dropdown, message)

### `pages/privacy-policy.html` (`/privacy-policy`)
- AdSense-compliant privacy policy
- Sections: overview, data collection, cookies, AdSense, data sharing, your rights

### `pages/disclaimer.html` (`/disclaimer`)
- AdSense-compliant disclaimer
- Sections: general, no professional advice, accuracy, third-party links, advertising disclosure

---

## 9. Clean URL System

### Production — Netlify:
`_redirects` file (project root):
```
/blog/*  /pages/blog-post.html  200
```
This serves `blog-post.html` for any `/blog/slug` URL. Physical files take priority (`blog/index.html` still serves `/blog/`). **No need to create `blog/[slug]/index.html` copies on Netlify.**

### Production — Apache:
`.htaccess` rewrites `/blog/slug` → `pages/blog-post.html?slug=slug`

### Local development (Live Server):
Physical folders with `index.html` copies serve as clean URLs:
- `/blog/` → `blog/index.html`
- `/blog/some-slug/` → `blog/some-slug/index.html`
- `/about/` → `about/index.html`

### Sync command (run after editing any page):
```powershell
Copy-Item "pages\blog-list.html" "blog\index.html" -Force
Copy-Item "pages\blog-post.html" "blog\luxury-apartments-dubai-guide\index.html" -Force
Copy-Item "pages\about.html" "about\index.html" -Force
Copy-Item "pages\contact.html" "contact\index.html" -Force
Copy-Item "pages\privacy-policy.html" "privacy-policy\index.html" -Force
Copy-Item "pages\disclaimer.html" "disclaimer\index.html" -Force
```

---

## 10. CSS Architecture

### Files:
| File | Purpose |
|---|---|
| `base.css` | CSS custom properties, reset, typography, utility classes |
| `header.css` | Sticky header, nav links, search box, theme toggle, hamburger, mobile drawer |
| `article.css` | Blog post page: 3-column grid, TOC sidebar, content blocks |
| `sidebar.css` | Right sidebar: trending reads cards |
| `blog-list.css` | Blog listing: hero section, featured card, post grid, Load More button, footer |
| `dark-mode.css` | `[data-theme="dark"]` overrides for all components |

### Key CSS variables (defined in base.css):
```css
--color-primary: #0EA5E9;          /* Sky blue accent */
--color-bg: #ffffff;                /* Light mode background */
--color-text: #1a1a2e;             /* Light mode text */
--font-body: 'Inter', sans-serif;
--font-heading: 'Playfair Display', serif;
--header-height: 80px;
--radius-lg: 14px;
```

---

## 11. JavaScript Architecture

### `theme.js` (loaded synchronously in `<head>`)
- Reads `localStorage('pi-theme')` or OS preference
- Sets `data-theme` attribute on `<html>`
- Binds click handler to `[data-theme-toggle]` buttons
- **CRITICAL:** Must be loaded ONCE per page. Loading twice causes double-toggle (no visible effect).

### `render.js` (deferred)
- Exposes `PropInsightRender` global object
- `renderPost(post, container)` — converts sections array to HTML
- `renderTrendingReads(posts, container)` — renders sidebar cards
- `renderAuthorAvatar(name)` — returns first letter

### `router.js` (deferred, blog-post.html only)
- Extracts slug from URL path segment
- Fetches `index.json` into `ALL_POSTS[]` array
- Fetches `data/posts/[slug]/post.json` for full content
- Calls `render.js` to build article
- Populates sidebar and "You May Also Like" from `ALL_POSTS`

### `header.js` (deferred)
- Hamburger menu open/close
- Mobile drawer overlay
- Search input toggle

---

## 12. Dark Mode System

- Toggle button has `data-theme-toggle` attribute
- Shows moon icon in light mode, sun icon in dark mode
- CSS toggles via `[data-theme="dark"]` selector
- `dark-mode.css` overrides all colors, backgrounds, borders
- `localStorage` key: `pi-theme` (values: `'dark'` or `'light'`)

---

## 13. Search Functionality

The search box is in the header. It filters posts client-side by title matching. The search input is **hidden by default** (`width: 0; opacity: 0; pointer-events: none`) and revealed when the user clicks the search icon, which adds `.open` class to `.search-input-wrapper`.

---

## 14. Sidebar System

On blog post pages, the right sidebar ("Trending Reads") shows other posts from `index.json`:
- Filters out the current post
- Shows post cards with cover image, category, title
- Each card links to `/blog/[slug]`
- Sticky positioning on desktop
- Static/full-width on mobile (≤1024px)

No extra network requests — all data comes from `ALL_POSTS` (loaded from `index.json`).

---

## 15. AdSense Compliance

The site is structured to comply with Google AdSense requirements:

✅ **Required pages present:** Privacy Policy, Disclaimer, About, Contact  
✅ **Privacy Policy mentions:** cookies, Google Analytics, Google AdSense, data collection, user rights  
✅ **Disclaimer mentions:** not professional advice, advertising disclosure, affiliate disclosure  
✅ **Ad placements:** Marked with `<!-- AD SLOT -->` comments (no code during development)  
✅ **Content quality:** Original, well-structured blog posts with proper headings  
✅ **Navigation:** Clear site structure with header, footer, breadcrumbs  
✅ **No deceptive elements:** No pop-ups, no fake buttons, no misleading ads  
✅ **Accessibility:** Alt text on images, ARIA labels, semantic HTML  

---

## 16. SEO & Meta Tags

Every page includes:
- `<title>` tag
- `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`)
- Twitter card tags
- Canonical URL
- Google Analytics

Blog posts additionally get:
- Dynamic meta from `post.json` → `meta` + `openGraph` + `twitter` objects
- Proper `<h1>` → `<h2>` → `<h3>` heading hierarchy
- Schema-ready content structure

---

## 17. Scaling to 11k+ Posts

The architecture is designed for scale:

- **index.json** is a flat array — one fetch, no N+1 problem
- Blog listing uses **client-side pagination** (6 per page, "Load More")
- Sidebar reads from the already-fetched `ALL_POSTS` array
- No individual post.json fetches for listing/sidebar (only when viewing a specific post)
- As the index grows, consider:
  - Splitting index.json by year/category if > 5MB
  - Adding server-side search for large catalogs
  - Implementing virtual scroll for very long lists

---

## 18. Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| Loading `theme.js` twice | Only load once in `<head>`, never duplicate with `defer` |
| Editing `blog/index.html` directly | Edit `pages/blog-list.html`, then copy |
| Using `../assets/` in blog-post.html | Use `/assets/` (absolute) — works at any URL depth |
| Escaped apostrophes in JSON (`\'`) | Use plain apostrophes — JSON strings use `"` delimiters |
| Forgetting to add to index.json | Post works at direct URL but won't appear in listings |
| Missing clean URL folder | Create `blog/[slug]/index.html` for local dev |
| Nav link pointing to `/blog` for Home | Home → `/`, Real Estate → `/blog` |

---

## 19. Deployment Checklist

### Netlify:
- [ ] `_redirects` file in project root with `/blog/*  /pages/blog-post.html  200`
- [ ] Custom domain configured: `realestate.globalinfonest.com`
- [ ] Physical `blog/index.html` exists (serves `/blog/` listing)
- [ ] No need for individual `blog/[slug]/index.html` copies

### General:
- [ ] All posts have entries in `index.json`
- [ ] All clean URL copies are synced from `pages/` (for local dev)
- [ ] Google Analytics tag (`G-WQFMWPTPDS`) on every page
- [ ] Ad slots hidden (`display: none`) until real ads placed
- [ ] Privacy Policy and Disclaimer pages are current
- [ ] All images have `alt` text
- [ ] Dark mode works on all pages
- [ ] Mobile responsive at all breakpoints
- [ ] Search input hidden by default (`.search-input-wrapper.open` reveals it)
- [ ] Hamburger button uses `#hamburger-btn` selector
- [ ] No console errors
- [ ] Footer: © 2026 GlobalInfoNest

---

## 20. Creating a Similar Site from Scratch

To create a new blog with this same architecture for a different niche:

1. **Copy the entire folder structure**
2. **Update `data/site-config.json`** with new site name, GA ID
3. **Global find & replace** "Real Estate World" → "Your Site Name"
4. **Update `base.css`** accent color (`--color-primary`)
5. **Replace content** in about, contact, privacy-policy, disclaimer pages
6. **Clear `data/posts/`** and `index.json` — start fresh
7. **Update `index.html`** hero text, feature cards, taglines
8. **Update `blog-list.html`** hero heading and tagline
9. **Add your blog posts** following the steps in Section 4

The entire engine (render.js, router.js, theme.js, header.js, all CSS) works as-is for any blog topic.

---

*Last updated: April 18, 2026*
