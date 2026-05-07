# UnderDunn Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the UnderDunn static blog with Astro + Tailwind CSS, migrate existing Hugo content, and deploy to Cloudflare Pages.

**Architecture:** Astro 5.x with Content Layer API (glob loader) for four content collections (writeups, research, series, personal). Dynamic routing via `[section]/[slug].astro` serves all posts. Warm earthy visual theme with dark/light mode toggle. Pagefind for client-side search.

**Tech Stack:** Astro 5, Tailwind CSS 4, Cloudflare Pages, Pagefind, Shiki (built-in), @astrojs/rss

**Design spec:** `docs/superpowers/specs/2026-05-07-underdunn-blog-design.md`

**Testing approach:** This is a static site — testing is build verification (`astro check`, `astro build`) and visual browser checks (`astro dev`). No unit test framework.

---

## File Map

**Config files (create):**
- `package.json` — dependencies and scripts
- `astro.config.mjs` — Astro config with Tailwind + Cloudflare
- `tsconfig.json` — TypeScript config
- `.gitignore` — ignore node_modules, dist, .astro

**Content schema (create):**
- `src/content.config.ts` — collection definitions for all 4 sections

**Styles (create):**
- `src/styles/global.css` — Tailwind directives, theme colors, prose typography

**Layouts (create):**
- `src/layouts/BaseLayout.astro` — HTML shell, head, meta, theme class
- `src/layouts/PostLayout.astro` — single post view with TOC sidebar
- `src/layouts/SectionLayout.astro` — section index listing

**Components (create):**
- `src/components/Header.astro` — nav, theme toggle, search trigger
- `src/components/Footer.astro` — copyright, RSS, GitHub
- `src/components/PostCard.astro` — post preview card
- `src/components/ThemeToggle.astro` — dark/light mode switch
- `src/components/TableOfContents.astro` — sticky sidebar TOC
- `src/components/SeriesNav.astro` — prev/next series banner
- `src/components/SearchDialog.astro` — Pagefind search modal

**Pages (create):**
- `src/pages/index.astro` — homepage with featured + latest
- `src/pages/about.astro` — about page
- `src/pages/rss.xml.ts` — RSS feed
- `src/pages/[section]/index.astro` — section listing
- `src/pages/[section]/[...slug].astro` — individual post

**Static assets (create):**
- `public/favicon.svg` — site favicon

**Content (migrate):**
- `content/posts/writeups/**` → `src/content/writeups/`
- `content/posts/research/**` → `src/content/research/`
- `content/posts/series/**` → `src/content/series/`
- `content/about/about.md` → content embedded in `src/pages/about.astro`

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Initialize the Astro project**

Run:
```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
```

This scaffolds a minimal Astro project in the current directory. The `--no-install` flag lets us add dependencies first. `--no-git` skips git init since we already have a repo.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install astro @astrojs/rss
```

Note: `@astrojs/cloudflare` is NOT needed — that adapter is for SSR on Cloudflare Workers. For a static site, Cloudflare Pages serves the built `dist/` directory directly.

Then install Tailwind:
```bash
npx astro add tailwind --yes
```

Then install Pagefind:
```bash
npm install -D pagefind
```

- [ ] **Step 3: Configure Astro**

Write `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://underdunn.pages.dev',
  integrations: [tailwindcss()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'one-dark-pro',
      },
    },
  },
});
```

- [ ] **Step 4: Configure .gitignore**

Add to `.gitignore` (append to whatever `create astro` generated):

```
node_modules/
dist/
.astro/
.superpowers/
```

- [ ] **Step 5: Add build scripts to package.json**

Ensure `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && npx pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

- [ ] **Step 6: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Dev server starts at `http://localhost:4321` with no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/
git commit -m "chore: scaffold Astro project with Tailwind and Cloudflare"
```

---

### Task 2: Tailwind Theme & Global Styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create global.css with Tailwind directives and theme**

Write `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-cream: #faf8f5;
  --color-cream-dark: #1a1512;
  --color-charcoal: #2d2d2d;
  --color-warm-light: #e0dbd5;
  --color-accent: #c9622f;
  --color-accent-hover: #b5561f;
  --color-muted: #888888;
  --color-muted-dark: #999999;
  --color-code-bg: #1e1e2e;
  --color-surface: #f0ece6;
  --color-surface-dark: #241e18;
  --color-border: #e0d6cc;
  --color-border-dark: #3a3230;

  --font-serif: Georgia, "Times New Roman", serif;
  --font-sans: "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-mono: "Fira Code", ui-monospace, monospace;
}

@custom-variant dark (&:where(.dark, .dark *));

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-cream);
  color: var(--color-charcoal);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dark body {
  background-color: var(--color-cream-dark);
  color: var(--color-warm-light);
}

.prose {
  font-family: var(--font-serif);
  font-size: 1.0625rem;
  line-height: 1.7;
  max-width: 72ch;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--color-charcoal);
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4 {
  color: var(--color-warm-light);
}

.prose h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.3em;
}

.dark .prose h2 {
  border-bottom-color: var(--color-border-dark);
}

.prose h3 {
  font-size: 1.25rem;
}

.prose p {
  margin-bottom: 1.25em;
}

.prose a {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.prose a:hover {
  color: var(--color-accent-hover);
}

.prose img {
  border-radius: 0.5rem;
  margin: 1.5em 0;
  max-width: 100%;
  height: auto;
}

.prose ul,
.prose ol {
  padding-left: 1.5em;
  margin-bottom: 1.25em;
}

.prose li {
  margin-bottom: 0.5em;
}

.prose blockquote {
  border-left: 3px solid var(--color-accent);
  padding-left: 1em;
  margin-left: 0;
  color: var(--color-muted);
  font-style: italic;
}

.dark .prose blockquote {
  color: var(--color-muted-dark);
}

.prose pre {
  background-color: var(--color-code-bg) !important;
  border-radius: 0.5rem;
  padding: 1em;
  overflow-x: auto;
  margin: 1.5em 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
}

.prose :not(pre) > code {
  background-color: var(--color-surface);
  padding: 0.15em 0.35em;
  border-radius: 0.25rem;
}

.dark .prose :not(pre) > code {
  background-color: var(--color-surface-dark);
}

.prose strong {
  font-weight: 700;
}
```

- [ ] **Step 2: Verify styles load**

Run `npm run dev`, open `http://localhost:4321`. The page background should be warm cream.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Tailwind theme with warm earthy color palette and prose styles"
```

---

### Task 3: Content Collections Schema

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/personal/.gitkeep`

- [ ] **Step 1: Create content.config.ts**

Write `src/content.config.ts`:

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const seriesSchema = postSchema.extend({
  series: z.string(),
  order: z.number(),
});

function postLoader(section: string) {
  return glob({
    base: `./src/content/${section}`,
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/[/\\]index\.md$/, ''),
  });
}

const writeups = defineCollection({
  loader: postLoader('writeups'),
  schema: postSchema,
});

const research = defineCollection({
  loader: postLoader('research'),
  schema: postSchema,
});

const series = defineCollection({
  loader: postLoader('series'),
  schema: seriesSchema,
});

const personal = defineCollection({
  loader: postLoader('personal'),
  schema: postSchema,
});

export const collections = { writeups, research, series, personal };
```

- [ ] **Step 2: Create empty personal section**

```bash
mkdir -p src/content/personal
touch src/content/personal/.gitkeep
```

This ensures the directory exists for the glob loader even before any personal posts are written.

- [ ] **Step 3: Verify schema compiles**

Run:
```bash
npx astro check
```

Expected: No errors related to content config.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content/personal/.gitkeep
git commit -m "feat: define content collection schemas for all four sections"
```

---

### Task 4: Content Migration

**Files:**
- Migrate: `content/posts/writeups/**` → `src/content/writeups/`
- Migrate: `content/posts/research/**` → `src/content/research/`
- Migrate: `content/posts/series/**` → `src/content/series/`

- [ ] **Step 1: Migrate writeups**

Flatten year-based subdirectories. Each post keeps its page bundle structure (directory with `index.md` + `images/`).

```bash
mkdir -p src/content/writeups

# Move each writeup, flattening year/event nesting
mv content/posts/writeups/2023/htb-uni-ctf/one-step-closer src/content/writeups/one-step-closer
mv content/posts/writeups/2023/htb-uni-ctf/zombienet src/content/writeups/zombienet
mv content/posts/writeups/2024/htb-uni-ctf/signaling-victorious src/content/writeups/signaling-victorious
mv content/posts/writeups/2025/theLEG src/content/writeups/the-leg
```

- [ ] **Step 2: Update writeup frontmatter**

For each writeup's `index.md`, ensure the frontmatter uses YAML format and remove the empty `images:` field. Add a `description` field. Remove the `toc` field.

Example — edit `src/content/writeups/zombienet/index.md` frontmatter to:

```yaml
---
title: "HackTheBox University CTF 2023 - ZombieNet"
date: 2023-10-17T11:23:50-05:00
description: "Investigating persistent access on a compromised OpenWRT router image from the HTB Uni CTF 2023."
draft: false
tags:
  - writeups
  - dfir
---
```

Apply similar edits to all writeup frontmatter: remove `toc`, remove empty `images:`, add `description`.

- [ ] **Step 3: Migrate research**

```bash
mkdir -p src/content/research

mv content/posts/research/2025/signal_windows_decryption src/content/research/signal-windows-decryption
mv content/posts/research/2025/windows_kernel_debugger src/content/research/windows-kernel-debugger
```

Update frontmatter for each research post (same pattern as writeups: remove `toc`, remove empty `images:`, add `description`).

- [ ] **Step 4: Migrate series**

```bash
mkdir -p src/content/series

mv content/posts/series/windows_drivers/p1_overview src/content/series/windows-drivers-p1-overview
mv content/posts/series/windows_drivers/p2_whats_a_driver src/content/series/windows-drivers-p2-whats-a-driver
mv content/posts/series/windows_drivers/p3_minimum_viable_driver src/content/series/windows-drivers-p3-minimum-viable-driver
mv content/posts/series/windows_drivers/p4_interacting_with_driver src/content/series/windows-drivers-p4-interacting-with-driver
mv content/posts/series/windows_drivers/p5_basic_driver_function src/content/series/windows-drivers-p5-basic-driver-function
mv content/posts/series/windows_drivers/p6_debugging_drivers src/content/series/windows-drivers-p6-debugging-drivers
mv content/posts/series/windows_drivers/p7_buffer_overflow_win7 src/content/series/windows-drivers-p7-buffer-overflow-win7
mv content/posts/series/windows_drivers/p8_smep_bypass src/content/series/windows-drivers-p8-smep-bypass
mv content/posts/series/windows_drivers/p9_win11_and_vbs src/content/series/windows-drivers-p9-win11-and-vbs
```

- [ ] **Step 5: Update series frontmatter**

For each series post, add `series` and `order` fields. Remove `toc`, remove empty `images:`, add `description`.

Example — `src/content/series/windows-drivers-p1-overview/index.md`:

```yaml
---
title: "Windows Drivers Series Part 1 - Overview"
date: 2025-07-14T19:07:00-05:00
description: "Introduction to the Windows driver exploitation series — who it's for, what tools you'll need, and why drivers are a great target."
draft: false
tags:
  - pwn
  - rev
  - windows
  - drivers
series: "windows-drivers"
order: 1
---
```

Repeat for all 9 parts, incrementing `order` from 1 to 9. Remove the `series` tag from the `tags` array (it's now a dedicated field).

- [ ] **Step 6: Remove old content directory**

```bash
rm -rf content/
```

- [ ] **Step 7: Verify build with migrated content**

Run:
```bash
npx astro check
```

Expected: No schema validation errors. All frontmatter matches the defined schemas.

- [ ] **Step 8: Commit**

```bash
git add src/content/ -A
git rm -r content/
git commit -m "feat: migrate Hugo content to Astro content collections

Flatten year-based subdirectories, convert frontmatter to Astro schemas,
add series/order fields to series posts."
```

---

### Task 5: BaseLayout & ThemeToggle

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ThemeToggle.astro`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create favicon**

Write `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#c9622f"/>
  <text x="16" y="23" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="#faf8f5">U</text>
</svg>
```

- [ ] **Step 2: Create ThemeToggle component**

Write `src/components/ThemeToggle.astro`:

```astro
---
---
<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle dark mode"
  class="p-2 rounded-lg text-muted hover:text-accent transition-colors cursor-pointer"
>
  <svg id="sun-icon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
  <svg id="moon-icon" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
</button>

<script>
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    if (!toggle || !sunIcon || !moonIcon) return;

    function applyTheme(dark: boolean) {
      document.documentElement.classList.toggle('dark', dark);
      sunIcon!.classList.toggle('hidden', !dark);
      moonIcon!.classList.toggle('hidden', dark);
    }

    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored === 'dark' || (stored === null && prefersDark));

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      sunIcon!.classList.toggle('hidden', !isDark);
      moonIcon!.classList.toggle('hidden', isDark);
    });
  }

  initTheme();
  document.addEventListener('astro:after-swap', initTheme);
</script>
```

- [ ] **Step 3: Create BaseLayout**

Write `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Security research, CTF writeups, and more.' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title="UnderDunn" href="/rss.xml" />
    <link rel="canonical" href={canonicalURL} />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <title>{title} | UnderDunn</title>
    <script is:inline>
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (stored === null && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    </script>
  </head>
  <body class="min-h-screen flex flex-col">
    <slot />
  </body>
</html>
```

The inline script in `<head>` prevents flash of wrong theme on load.

- [ ] **Step 4: Update the default index page to use BaseLayout**

Write `src/pages/index.astro` (temporary — will be replaced in Task 12):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <main class="flex-1 max-w-4xl mx-auto px-4 py-12">
    <h1 class="font-serif text-3xl font-bold text-accent">UnderDunn</h1>
    <p class="mt-4 text-muted">Blog coming together...</p>
  </main>
</BaseLayout>
```

- [ ] **Step 5: Verify in browser**

Run `npm run dev`, open `http://localhost:4321`.

Expected: Warm cream background, burnt orange "UnderDunn" heading. The theme toggle icon should be visible (once Header is added). For now, manually add `dark` class to `<html>` in devtools to verify dark mode styles work.

- [ ] **Step 6: Commit**

```bash
git add public/favicon.svg src/layouts/BaseLayout.astro src/components/ThemeToggle.astro src/pages/index.astro
git commit -m "feat: add BaseLayout with theme toggle and favicon"
```

---

### Task 6: Header & Footer

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create Header component**

Write `src/components/Header.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.astro';

const sections = [
  { name: 'Writeups', path: '/writeups' },
  { name: 'Research', path: '/research' },
  { name: 'Series', path: '/series' },
  { name: 'Personal', path: '/personal' },
];

const currentPath = Astro.url.pathname;
---
<header class="border-b border-border dark:border-border-dark">
  <nav class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="font-serif text-xl font-bold text-accent hover:text-accent-hover transition-colors">
      UnderDunn
    </a>

    <div class="flex items-center gap-6">
      <ul class="hidden md:flex items-center gap-4 text-sm">
        {sections.map(({ name, path }) => (
          <li>
            <a
              href={path}
              class:list={[
                'transition-colors',
                currentPath.startsWith(path)
                  ? 'text-accent font-medium'
                  : 'text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-warm-light',
              ]}
            >
              {name}
            </a>
          </li>
        ))}
        <li>
          <a
            href="/about"
            class:list={[
              'transition-colors',
              currentPath === '/about'
                ? 'text-accent font-medium'
                : 'text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-warm-light',
            ]}
          >
            About
          </a>
        </li>
      </ul>

      <button
        id="search-trigger"
        type="button"
        aria-label="Search"
        class="p-2 text-muted hover:text-accent transition-colors cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <ThemeToggle />

      <button
        id="mobile-menu-toggle"
        type="button"
        aria-label="Toggle menu"
        class="md:hidden p-2 text-muted hover:text-accent transition-colors cursor-pointer"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </nav>

  <div id="mobile-menu" class="hidden md:hidden border-t border-border dark:border-border-dark px-4 py-3">
    <ul class="flex flex-col gap-2 text-sm">
      {sections.map(({ name, path }) => (
        <li>
          <a
            href={path}
            class:list={[
              'block py-1 transition-colors',
              currentPath.startsWith(path)
                ? 'text-accent font-medium'
                : 'text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-warm-light',
            ]}
          >
            {name}
          </a>
        </li>
      ))}
      <li>
        <a href="/about" class="block py-1 text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-warm-light transition-colors">
          About
        </a>
      </li>
    </ul>
  </div>
</header>

<script>
  function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
  }
  initMobileMenu();
  document.addEventListener('astro:after-swap', initMobileMenu);
</script>
```

- [ ] **Step 2: Create Footer component**

Write `src/components/Footer.astro`:

```astro
---
const year = new Date().getFullYear();
---
<footer class="border-t border-border dark:border-border-dark mt-auto">
  <div class="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted dark:text-muted-dark">
    <p>&copy; {year} UnderDunn. All rights reserved.</p>
    <div class="flex items-center gap-4">
      <a href="/rss.xml" class="hover:text-accent transition-colors">RSS</a>
      <a href="https://github.com/jeremy-dunn" class="hover:text-accent transition-colors">GitHub</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Add Header and Footer to BaseLayout**

Modify `src/layouts/BaseLayout.astro` — add imports and place Header/Footer around the slot:

Add to the frontmatter imports:
```typescript
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
```

Replace the `<body>` contents:
```html
<body class="min-h-screen flex flex-col">
  <Header />
  <slot />
  <Footer />
</body>
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Expected: Header with nav links, burnt orange "UnderDunn" title, search icon, theme toggle, and footer with copyright and links. Theme toggle should switch between light and dark. Mobile menu should toggle on narrow viewports.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro
git commit -m "feat: add Header with nav and mobile menu, Footer with links"
```

---

### Task 7: PostCard Component

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utility functions**

Write `src/lib/utils.ts`:

```typescript
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const sectionMeta: Record<string, { label: string; description: string }> = {
  writeups: { label: 'Writeups', description: 'CTF challenge solutions and walkthroughs' },
  research: { label: 'Research', description: 'Security research posts' },
  series: { label: 'Series', description: 'Multi-part series' },
  personal: { label: 'Personal', description: 'Non-technical posts' },
};
```

- [ ] **Step 2: Create PostCard component**

Write `src/components/PostCard.astro`:

```astro
---
import { formatDate } from '../lib/utils';

interface Props {
  title: string;
  description?: string;
  date: Date;
  section: string;
  sectionLabel: string;
  slug: string;
  tags?: string[];
  readTime?: number;
}

const { title, description, date, section, sectionLabel, slug, tags = [], readTime } = Astro.props;
---
<article class="group">
  <a href={`/${section}/${slug}`} class="block p-4 -mx-4 rounded-lg hover:bg-surface dark:hover:bg-surface-dark transition-colors">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs font-medium text-accent bg-surface dark:bg-surface-dark px-2 py-0.5 rounded">
        {sectionLabel}
      </span>
      <span class="text-xs text-muted dark:text-muted-dark">{formatDate(date)}</span>
      {readTime && <span class="text-xs text-muted dark:text-muted-dark">&middot; {readTime} min read</span>}
    </div>
    <h3 class="font-serif text-lg font-semibold text-charcoal dark:text-warm-light group-hover:text-accent transition-colors">
      {title}
    </h3>
    {description && (
      <p class="mt-1 text-sm text-muted dark:text-muted-dark line-clamp-2">{description}</p>
    )}
    {tags.length > 0 && (
      <div class="mt-2 flex flex-wrap gap-1">
        {tags.map(tag => (
          <span class="text-xs text-muted dark:text-muted-dark bg-surface dark:bg-surface-dark px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    )}
  </a>
</article>
```

- [ ] **Step 3: Verify component compiles**

Run `npx astro check`. Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PostCard.astro src/lib/utils.ts
git commit -m "feat: add PostCard component and utility functions"
```

---

### Task 8: Section Index Pages

**Files:**
- Create: `src/pages/[section]/index.astro`

- [ ] **Step 1: Create section index page**

Write `src/pages/[section]/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { sectionMeta, estimateReadTime } from '../../lib/utils';

export async function getStaticPaths() {
  const sections = ['writeups', 'research', 'series', 'personal'] as const;
  return sections.map(section => ({ params: { section } }));
}

const { section } = Astro.params;
const meta = sectionMeta[section] ?? { label: section, description: '' };
const allPosts = await getCollection(section, ({ data }) => !data.draft);

let posts;
let seriesGroups: Map<string, { count: number; firstPost: any }> | null = null;

if (section === 'series') {
  const sorted = allPosts.sort((a, b) => {
    if (a.data.series !== b.data.series) return a.data.series.localeCompare(b.data.series);
    return a.data.order - b.data.order;
  });

  seriesGroups = new Map();
  for (const post of sorted) {
    const name = post.data.series;
    if (!seriesGroups.has(name)) {
      seriesGroups.set(name, { count: 0, firstPost: post });
    }
    seriesGroups.get(name)!.count++;
  }

  posts = sorted;
} else {
  posts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
---
<BaseLayout title={meta.label} description={meta.description}>
  <main class="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
    <div class="mb-8">
      <h1 class="font-serif text-3xl font-bold text-charcoal dark:text-warm-light">{meta.label}</h1>
      <p class="mt-2 text-muted dark:text-muted-dark">{meta.description}</p>
    </div>

    {section === 'series' && seriesGroups ? (
      <div class="space-y-10">
        {[...seriesGroups.entries()].map(([seriesName, { count, firstPost }]) => {
          const seriesPosts = posts!.filter(p => p.data.series === seriesName);
          const displayName = seriesName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return (
            <section>
              <h2 class="font-serif text-xl font-semibold text-charcoal dark:text-warm-light mb-1">
                {displayName}
              </h2>
              <p class="text-sm text-muted dark:text-muted-dark mb-4">{count} parts</p>
              <div class="space-y-1">
                {seriesPosts.map(post => (
                  <PostCard
                    title={post.data.title}
                    description={post.data.description}
                    date={post.data.date}
                    section="series"
                    sectionLabel={`Part ${post.data.order}`}
                    slug={post.id}
                    tags={post.data.tags}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    ) : (
      <div class="space-y-1">
        {posts.map(post => (
          <PostCard
            title={post.data.title}
            description={post.data.description}
            date={post.data.date}
            section={section}
            sectionLabel={meta.label}
            slug={post.id}
            tags={post.data.tags}
          />
        ))}
      </div>
    )}

    {posts.length === 0 && (
      <p class="text-muted dark:text-muted-dark italic">No posts yet. Check back soon!</p>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify section pages render**

Run `npm run dev`. Navigate to `http://localhost:4321/writeups`, `/research`, `/series`, `/personal`.

Expected: Each section shows its posts listed chronologically. The series page shows posts grouped by series name with part counts. The personal page shows an empty state message.

- [ ] **Step 3: Commit**

```bash
git add src/pages/\[section\]/index.astro
git commit -m "feat: add dynamic section index pages with series grouping"
```

---

### Task 9: Post Pages with PostLayout

**Files:**
- Create: `src/pages/[section]/[...slug].astro`
- Create: `src/layouts/PostLayout.astro`

- [ ] **Step 1: Create PostLayout**

Write `src/layouts/PostLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import TableOfContents from '../components/TableOfContents.astro';
import SeriesNav from '../components/SeriesNav.astro';
import { formatDate } from '../lib/utils';

interface Props {
  title: string;
  date: Date;
  description?: string;
  section: string;
  sectionLabel: string;
  tags?: string[];
  readTime?: number;
  headings: { depth: number; slug: string; text: string }[];
  series?: { name: string; order: number; total: number; prev?: { title: string; slug: string }; next?: { title: string; slug: string } };
}

const { title, date, description, section, sectionLabel, tags = [], readTime, headings, series } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <main class="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
    {series && (
      <SeriesNav
        seriesName={series.name}
        current={series.order}
        total={series.total}
        prev={series.prev}
        next={series.next}
        section="series"
      />
    )}

    <div class="flex gap-12">
      <article class="flex-1 min-w-0">
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <a href={`/${section}`} class="text-xs font-medium text-accent bg-surface dark:bg-surface-dark px-2 py-0.5 rounded hover:bg-accent hover:text-cream transition-colors">
              {sectionLabel}
            </a>
          </div>
          <h1 class="font-serif text-3xl font-bold text-charcoal dark:text-warm-light leading-tight">
            {title}
          </h1>
          <div class="mt-3 flex items-center gap-3 text-sm text-muted dark:text-muted-dark">
            <time datetime={date.toISOString()}>{formatDate(date)}</time>
            {readTime && <span>&middot; {readTime} min read</span>}
          </div>
        </header>

        <div class="prose dark:text-warm-light">
          <slot />
        </div>

        {tags.length > 0 && (
          <div class="mt-8 pt-6 border-t border-border dark:border-border-dark flex flex-wrap gap-2">
            {tags.map(tag => (
              <span class="text-xs text-muted dark:text-muted-dark bg-surface dark:bg-surface-dark px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {headings.length > 0 && (
        <aside class="hidden lg:block w-56 shrink-0">
          <TableOfContents headings={headings} />
        </aside>
      )}
    </div>

    {headings.length > 0 && (
      <div class="lg:hidden mt-8 pt-6 border-t border-border dark:border-border-dark">
        <details class="group">
          <summary class="text-sm font-medium text-muted dark:text-muted-dark cursor-pointer">Table of Contents</summary>
          <div class="mt-2">
            <TableOfContents headings={headings} />
          </div>
        </details>
      </div>
    )}

    {series && (
      <div class="mt-12">
        <SeriesNav
          seriesName={series.name}
          current={series.order}
          total={series.total}
          prev={series.prev}
          next={series.next}
          section="series"
        />
      </div>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 2: Create the dynamic post page**

Write `src/pages/[section]/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { sectionMeta, estimateReadTime } from '../../lib/utils';

export async function getStaticPaths() {
  const sections = ['writeups', 'research', 'series', 'personal'] as const;
  const paths = [];

  for (const section of sections) {
    const posts = await getCollection(section, ({ data }) => !data.draft);

    if (section === 'series') {
      const sorted = posts.sort((a, b) => a.data.order - b.data.order);
      const bySeries = new Map<string, typeof sorted>();
      for (const post of sorted) {
        const name = post.data.series;
        if (!bySeries.has(name)) bySeries.set(name, []);
        bySeries.get(name)!.push(post);
      }

      for (const post of sorted) {
        const seriesPosts = bySeries.get(post.data.series)!;
        const idx = seriesPosts.findIndex(p => p.id === post.id);
        paths.push({
          params: { section, slug: post.id },
          props: {
            post,
            section,
            seriesInfo: {
              name: post.data.series,
              order: post.data.order,
              total: seriesPosts.length,
              prev: idx > 0 ? { title: seriesPosts[idx - 1].data.title, slug: seriesPosts[idx - 1].id } : undefined,
              next: idx < seriesPosts.length - 1 ? { title: seriesPosts[idx + 1].data.title, slug: seriesPosts[idx + 1].id } : undefined,
            },
          },
        });
      }
    } else {
      for (const post of posts) {
        paths.push({
          params: { section, slug: post.id },
          props: { post, section, seriesInfo: undefined },
        });
      }
    }
  }

  return paths;
}

const { post, section, seriesInfo } = Astro.props;
const meta = sectionMeta[section] ?? { label: section, description: '' };
const { Content, headings } = await render(post);
const body = post.body ?? '';
const readTime = estimateReadTime(body);
---
<PostLayout
  title={post.data.title}
  date={post.data.date}
  description={post.data.description}
  section={section}
  sectionLabel={meta.label}
  tags={post.data.tags}
  readTime={readTime}
  headings={headings}
  series={seriesInfo}
>
  <Content />
</PostLayout>
```

- [ ] **Step 3: Verify posts render**

Run `npm run dev`. Navigate to a writeup (e.g., `http://localhost:4321/writeups/zombienet`) and a series post (e.g., `http://localhost:4321/series/windows-drivers-p1-overview`).

Expected: Post renders with title, date, section badge, read time, full markdown content, syntax-highlighted code blocks, and images. Series posts should show series navigation (once SeriesNav is created in the next task — for now it will error, so create a placeholder first).

- [ ] **Step 4: Commit**

```bash
git add src/layouts/PostLayout.astro "src/pages/[section]/[...slug].astro"
git commit -m "feat: add PostLayout and dynamic post pages for all sections"
```

---

### Task 10: Table of Contents with Scroll Spy

**Files:**
- Create: `src/components/TableOfContents.astro`

- [ ] **Step 1: Create TableOfContents component**

Write `src/components/TableOfContents.astro`:

```astro
---
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const filtered = headings.filter(h => h.depth >= 2 && h.depth <= 3);
---
{filtered.length > 0 && (
  <nav class="sticky top-8" aria-label="Table of contents">
    <p class="text-xs font-medium uppercase tracking-wider text-muted dark:text-muted-dark mb-3">
      On this page
    </p>
    <ul class="space-y-1.5 text-sm border-l border-border dark:border-border-dark">
      {filtered.map(heading => (
        <li>
          <a
            href={`#${heading.slug}`}
            class:list={[
              'toc-link block transition-colors border-l-2 -ml-px',
              heading.depth === 3 ? 'pl-6' : 'pl-3',
              'border-transparent text-muted dark:text-muted-dark hover:text-charcoal dark:hover:text-warm-light hover:border-accent',
            ]}
            data-heading={heading.slug}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)}

<script>
  function initScrollSpy() {
    const links = document.querySelectorAll<HTMLAnchorElement>('.toc-link');
    if (links.length === 0) return;

    const headingIds = Array.from(links).map(l => l.dataset.heading!);
    const headingEls = headingIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    function update() {
      let activeId = headingIds[0];
      for (const el of headingEls) {
        if (el.getBoundingClientRect().top <= 100) {
          activeId = el.id;
        }
      }
      links.forEach(link => {
        const isActive = link.dataset.heading === activeId;
        link.classList.toggle('border-accent', isActive);
        link.classList.toggle('text-accent', isActive);
        link.classList.toggle('border-transparent', !isActive);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  initScrollSpy();
  document.addEventListener('astro:after-swap', initScrollSpy);
</script>
```

- [ ] **Step 2: Verify TOC renders**

Run `npm run dev`. Navigate to a long post like `http://localhost:4321/series/windows-drivers-p6-debugging-drivers`.

Expected: Sticky sidebar on the right with heading links. Clicking a link scrolls to that section. As you scroll, the current section highlights in burnt orange. On narrow viewports, the TOC appears as a collapsible `<details>` element below the content.

- [ ] **Step 3: Commit**

```bash
git add src/components/TableOfContents.astro
git commit -m "feat: add TableOfContents with scroll-spy highlighting"
```

---

### Task 11: Series Navigation

**Files:**
- Create: `src/components/SeriesNav.astro`

- [ ] **Step 1: Create SeriesNav component**

Write `src/components/SeriesNav.astro`:

```astro
---
interface Props {
  seriesName: string;
  current: number;
  total: number;
  prev?: { title: string; slug: string };
  next?: { title: string; slug: string };
  section: string;
}

const { seriesName, current, total, prev, next, section } = Astro.props;
const displayName = seriesName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
---
<nav class="bg-accent text-cream rounded-lg px-4 py-3" aria-label="Series navigation">
  <div class="flex items-center justify-between flex-wrap gap-2">
    <div class="flex items-center gap-3">
      {prev ? (
        <a href={`/${section}/${prev.slug}`} class="text-sm hover:underline" title={prev.title}>
          &larr; Prev
        </a>
      ) : (
        <span class="text-sm opacity-40">&larr; Prev</span>
      )}
    </div>

    <div class="text-center">
      <span class="font-serif font-semibold">{displayName}</span>
      <span class="text-sm opacity-80 ml-2">Part {current} of {total}</span>
    </div>

    <div class="flex items-center gap-3">
      {next ? (
        <a href={`/${section}/${next.slug}`} class="text-sm hover:underline" title={next.title}>
          Next &rarr;
        </a>
      ) : (
        <span class="text-sm opacity-40">Next &rarr;</span>
      )}
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Verify series navigation**

Run `npm run dev`. Navigate to `http://localhost:4321/series/windows-drivers-p3-minimum-viable-driver`.

Expected: Burnt orange banner at top and bottom of the post with "Windows Drivers — Part 3 of 9", a "Prev" link pointing to Part 2, and a "Next" link pointing to Part 4. First post should have disabled "Prev", last post should have disabled "Next".

- [ ] **Step 3: Commit**

```bash
git add src/components/SeriesNav.astro
git commit -m "feat: add series navigation banner with prev/next links"
```

---

### Task 12: Homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build the homepage**

Write `src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import { sectionMeta, estimateReadTime } from '../lib/utils';

type PostEntry = {
  id: string;
  data: { title: string; date: Date; description?: string; draft: boolean; tags: string[]; featured?: boolean };
  body?: string;
  section: string;
};

const sections = ['writeups', 'research', 'series', 'personal'] as const;
const allPosts: PostEntry[] = [];

for (const section of sections) {
  const posts = await getCollection(section, ({ data }) => !data.draft);
  for (const post of posts) {
    allPosts.push({ ...post, section });
  }
}

allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const featuredPost = allPosts.find(p => p.data.featured) ?? allPosts[0];
const recentPosts = allPosts.filter(p => p.id !== featuredPost?.id).slice(0, 6);
---
<BaseLayout title="Home" description="Security research, CTF writeups, and more.">
  <main class="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
    <section class="text-center mb-12">
      <h1 class="font-serif text-4xl font-bold text-charcoal dark:text-warm-light">UnderDunn</h1>
      <p class="mt-3 text-lg text-muted dark:text-muted-dark">Security research, CTF writeups, and more.</p>
    </section>

    {featuredPost && (
      <section class="mb-12">
        <p class="text-xs font-medium uppercase tracking-wider text-accent mb-3">Featured</p>
        <a
          href={`/${featuredPost.section}/${featuredPost.id}`}
          class="block p-6 rounded-lg border-2 border-accent bg-surface dark:bg-surface-dark hover:border-accent-hover transition-colors"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-medium text-accent">
              {sectionMeta[featuredPost.section]?.label ?? featuredPost.section}
            </span>
          </div>
          <h2 class="font-serif text-2xl font-bold text-charcoal dark:text-warm-light">
            {featuredPost.data.title}
          </h2>
          {featuredPost.data.description && (
            <p class="mt-2 text-muted dark:text-muted-dark">{featuredPost.data.description}</p>
          )}
        </a>
      </section>
    )}

    {recentPosts.length > 0 && (
      <section>
        <p class="text-xs font-medium uppercase tracking-wider text-muted dark:text-muted-dark mb-4">Latest</p>
        <div class="space-y-1">
          {recentPosts.map(post => (
            <PostCard
              title={post.data.title}
              description={post.data.description}
              date={post.data.date}
              section={post.section}
              sectionLabel={sectionMeta[post.section]?.label ?? post.section}
              slug={post.id}
              tags={post.data.tags}
            />
          ))}
        </div>
      </section>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify homepage**

Run `npm run dev`. Open `http://localhost:4321`.

Expected: "UnderDunn" title, tagline, a featured post card with burnt orange border, then a list of recent posts from all sections. Each post shows its section badge.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage with featured post and latest posts feed"
```

---

### Task 13: About Page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create about page**

Write `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About" description="About the author of UnderDunn.">
  <main class="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
    <h1 class="font-serif text-3xl font-bold text-charcoal dark:text-warm-light mb-8">About</h1>
    <div class="prose dark:text-warm-light">
      <p>I like sunsets, long walks on the beach, and classic literature. The key to my heart is peanut butter ice cream. Not like other computer nerds.</p>
      <p>I specialize in low level computer security, spending a lot of time in both the capability development and incident response spaces. Recently I've been studying insecure handling of IOCTLs in Windows Kernel drivers, as well as data leakage through abuse of speculative execution extensions in modern processors.</p>
      <p>My first area of study was forensics, and I have experience in both law enforcement and incident response areas. The field is near and dear to my heart, and many of the posts here will be related to forensics.</p>
      <p>Outside of cyber, I'm an avid hiker and archer, and try to spend as much of my time outside as possible.</p>
      <p>I've had a lot of help from some amazing people in my life, and love to give back to the community when I can. If you find any of the posts on this blog helpful or interesting, please feel free to reach out.</p>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify about page**

Run `npm run dev`. Navigate to `http://localhost:4321/about`.

Expected: Clean about page with prose styling, warm serif text.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add about page with author bio"
```

---

### Task 14: RSS Feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Create RSS feed**

Write `src/pages/rss.xml.ts`:

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { sectionMeta } from '../lib/utils';

export const GET: APIRoute = async (context) => {
  const sections = ['writeups', 'research', 'series', 'personal'] as const;
  const allPosts: { id: string; data: any; section: string }[] = [];

  for (const section of sections) {
    const posts = await getCollection(section, ({ data }) => !data.draft);
    for (const post of posts) {
      allPosts.push({ ...post, section });
    }
  }

  allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'UnderDunn',
    description: 'Security research, CTF writeups, and more.',
    site: context.site!,
    items: allPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: `/${post.section}/${post.id}/`,
      categories: [sectionMeta[post.section]?.label ?? post.section],
    })),
  });
};
```

- [ ] **Step 2: Verify RSS feed**

Run `npm run dev`. Navigate to `http://localhost:4321/rss.xml`.

Expected: Valid RSS XML with all posts, each with title, date, description, link, and category.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rss.xml.ts
git commit -m "feat: add RSS feed across all sections"
```

---

### Task 15: Search with Pagefind

**Files:**
- Create: `src/components/SearchDialog.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create SearchDialog component**

Write `src/components/SearchDialog.astro`:

```astro
---
---
<div id="search-overlay" class="hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
  <div class="max-w-2xl mx-auto mt-20 px-4">
    <div class="bg-cream dark:bg-cream-dark rounded-lg shadow-xl border border-border dark:border-border-dark overflow-hidden">
      <div id="pagefind-container" class="p-4"></div>
    </div>
  </div>
</div>

<script>
  function initSearch() {
    const overlay = document.getElementById('search-overlay');
    const trigger = document.getElementById('search-trigger');
    const container = document.getElementById('pagefind-container');
    if (!overlay || !trigger || !container) return;

    let loaded = false;

    function openSearch() {
      overlay!.classList.remove('hidden');
      if (!loaded) {
        loaded = true;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/pagefind/pagefind-ui.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = '/pagefind/pagefind-ui.js';
        script.onload = () => {
          // @ts-ignore
          new PagefindUI({
            element: '#pagefind-container',
            showSubResults: true,
            showImages: false,
          });
          setTimeout(() => {
            const input = container!.querySelector<HTMLInputElement>('input');
            input?.focus();
          }, 100);
        };
        document.head.appendChild(script);
      } else {
        setTimeout(() => {
          const input = container!.querySelector<HTMLInputElement>('input');
          input?.focus();
        }, 50);
      }
    }

    function closeSearch() {
      overlay!.classList.add('hidden');
    }

    trigger.addEventListener('click', openSearch);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    });
  }

  initSearch();
  document.addEventListener('astro:after-swap', initSearch);
</script>
```

- [ ] **Step 2: Add SearchDialog to BaseLayout**

Modify `src/layouts/BaseLayout.astro` — add import and place component before closing `</body>`:

Add to frontmatter imports:
```typescript
import SearchDialog from '../components/SearchDialog.astro';
```

Add before `</body>`:
```html
<SearchDialog />
```

- [ ] **Step 3: Verify search builds**

Run:
```bash
npm run build
```

Expected: Build succeeds, Pagefind indexes the site and creates `/dist/pagefind/` directory with search index files.

- [ ] **Step 4: Test search locally**

Run:
```bash
npm run preview
```

Open `http://localhost:4321`. Click the search icon or press `Ctrl+K`. The search dialog should open. Type a query like "driver" — results should appear from the indexed posts.

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchDialog.astro src/layouts/BaseLayout.astro
git commit -m "feat: add Pagefind search with keyboard shortcut (Ctrl+K)"
```

---

### Task 16: Production Build & Final Verification

**Files:**
- No new files — verification only

- [ ] **Step 1: Run type check**

```bash
npx astro check
```

Expected: No TypeScript errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build completes successfully. Output in `dist/`. Pagefind index generated.

- [ ] **Step 3: Preview and verify all pages**

```bash
npm run preview
```

Verify each of these in the browser:

1. **Homepage** (`/`) — hero, featured post, recent posts
2. **Section index** (`/writeups`) — list of writeup posts
3. **Series index** (`/series`) — posts grouped by series with part counts
4. **Individual post** (`/writeups/zombienet`) — full content, images, code highlighting
5. **Series post** (`/series/windows-drivers-p3-minimum-viable-driver`) — series banner with prev/next, sticky TOC
6. **About** (`/about`) — bio content
7. **RSS** (`/rss.xml`) — valid XML feed
8. **Search** — Ctrl+K opens search, queries return results
9. **Dark mode** — toggle works, all pages look correct in both modes
10. **Mobile** — responsive nav, collapsed TOC, readable content
11. **Personal** (`/personal`) — empty state message

- [ ] **Step 4: Commit any final fixes**

If any issues were found and fixed during verification:

```bash
git add -A
git commit -m "fix: final adjustments from production verification"
```

- [ ] **Step 5: Verify clean git status**

```bash
git status
```

Expected: Clean working tree, all changes committed.
