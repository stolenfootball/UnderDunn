# UnderDunn Blog - Design Specification

## Overview

UnderDunn is a static blog built with Astro and Tailwind CSS, deployed to Cloudflare Pages. It serves as a multi-purpose platform for technical writing (security research, CTF writeups, driver exploitation series), personal posts, and future expansion into non-technical interests (archery, philosophy). Content is authored as markdown files with co-located images.

## Goals

- Launch with core blog functionality and existing content migrated from a Hugo-based blog
- Iteratively add new sections as content develops
- Prioritize readability and a warm, approachable aesthetic
- Minimize maintenance overhead — focus on writing, not tooling

## Tech Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Deployment:** Cloudflare Pages via `@astrojs/cloudflare` adapter
- **Search:** Pagefind (build-time indexing, client-side search)
- **Syntax Highlighting:** Shiki (built into Astro, zero-config)
- **License:** GPL v3

## Content Architecture

### Approach: Content Collections with Flat Sections

Each section is a separate Astro Content Collection. Posts use Hugo-style page bundles — an `index.md` file inside a named directory with co-located images in an `images/` subfolder.

### Sections at Launch

| Section | Path | Description |
|---------|------|-------------|
| writeups | `/writeups/` | CTF challenge solutions and walkthroughs |
| research | `/research/` | Security research posts |
| series | `/series/` | Multi-part series (e.g., Windows Drivers) |
| personal | `/personal/` | Non-technical posts |

New sections (archery, philosophy, etc.) are added by creating a folder in `src/content/`, registering the collection in `config.ts`, and adding the section to the nav. No new page files needed thanks to dynamic routing.

### Project Structure

```
underdunn/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   ├── writeups/
│   │   │   └── zombienet/
│   │   │       ├── index.md
│   │   │       └── images/
│   │   ├── research/
│   │   │   └── signal-windows-decryption/
│   │   │       ├── index.md
│   │   │       └── images/
│   │   ├── series/
│   │   │   └── windows-drivers-p1-overview/
│   │   │       └── index.md
│   │   └── personal/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── SeriesNav.astro
│   │   ├── SearchDialog.astro
│   │   ├── ThemeToggle.astro
│   │   └── TableOfContents.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PostLayout.astro
│   │   └── SectionLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── rss.xml.ts
│   │   └── [section]/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
```

## Content Schema

### Standard Post (writeups, research, personal)

```yaml
---
title: "Post Title"
date: 2025-07-14T19:07:00-05:00
description: "Brief summary for cards and SEO"
draft: false
tags:
  - dfir
  - windows
---
```

### Series Post

Inherits all standard fields, adds:

```yaml
---
title: "Windows Drivers Series Part 3 - The Minimum Viable Driver"
date: 2025-07-17T19:45:29-0400
description: "Setting up the dev environment and compiling your first driver"
draft: false
tags:
  - pwn
  - windows
  - drivers
series: "windows-drivers"
order: 3
---
```

### Schema Details

- `title` (required): Post title
- `date` (required): Publication date in ISO 8601 format
- `description` (optional): Summary for post cards and SEO meta tags; falls back to first ~150 characters of content
- `draft` (required): Boolean; `true` excludes from production builds, visible in dev
- `tags` (optional): Array of string tags for categorization
- `series` (optional, series section only): String identifier grouping posts in a series (e.g., `"windows-drivers"`)
- `order` (optional, series section only): Integer defining position within a series (1-based)
- `featured` (optional): Boolean; `true` pins the post as the featured item on the homepage

### Image Handling

Posts use co-located images referenced with relative paths:

```markdown
![Alt text](./images/filename.png)
```

Images live in an `images/` subfolder next to the post's `index.md`. Astro's Content Collections support this pattern natively.

## Site Layout

### Homepage: Featured + Latest

- Header with site title and section navigation
- Hero area with site tagline
- Featured/pinned post card at the top, selected via `featured: true` in a post's frontmatter (most recent featured post wins; if none are featured, the most recent post across all sections is shown)
- Row of recent post cards below, pulled from all sections (excluding the featured post)
- Each card shows title, description, section badge, and date

### Section Index: Simple List

- Section title and description at top
- Chronological list of post cards with title, description, date, estimated read time, and tags
- The `/series/` section index lists each series as a card showing the series name and part count; clicking a series card navigates to a filtered view listing all posts in that series in order

### Post Page: Sticky Sidebar TOC + Series Navigation

- Section badge, title, date, and read time at top
- Main content column (constrained width for readability)
- Sticky sidebar on the right with auto-generated table of contents and scroll-spy highlighting
- Sidebar collapses to inline TOC on mobile
- Tags displayed below content
- Series posts get a navigation banner at top and bottom with prev/next links and "Part X of Y" progress indicator

### Navigation

- Persistent header with: site title (links home), section links (Writeups, Research, Series, Personal), About link, theme toggle, search trigger
- Footer with copyright notice, RSS link, and GitHub link

## Visual Design

### Color Palette: Warm Earthy

**Light mode:**
- Background: warm cream (`#faf8f5`)
- Text: dark charcoal (`#2d2d2d`)
- Secondary text: medium gray (`#888`)
- Accent: burnt orange (`#c9622f`)
- Code blocks: dark background (`#1e1e2e`)

**Dark mode:**
- Background: deep warm dark (`#1a1512`)
- Text: warm light (`#e0dbd5`)
- Secondary text: muted (`#999`)
- Accent: burnt orange (`#c9622f`) — consistent across modes
- Code blocks: dark background (`#1e1e2e`)

### Typography

- Headings: serif font (Georgia or similar)
- Body: serif for post content (readability), sans-serif for UI elements
- Code: monospace (system default or Fira Code)
- Comfortable line height (~1.7) for long-form reading

### Tone

Warm, approachable, clean, and readable. The design should feel inviting whether someone is reading a deep technical tutorial or a personal reflection. The burnt orange accent gives UnderDunn a distinctive identity without being loud.

## Features

### Syntax Highlighting

- Built-in Shiki integration via Astro — zero-config, build-time rendering
- No client-side JavaScript for highlighting
- Supports C, C++, Python, assembly, PowerShell, bash, and all other common languages

### Dark/Light Mode Toggle

- Tailwind `dark:` variant with class-based toggling
- User preference stored in `localStorage`
- Defaults to system preference on first visit
- Smooth CSS transitions between modes

### RSS Feed

- Generated at `/rss.xml` using `@astrojs/rss`
- Combined feed across all sections
- Each post's section included as a category
- Per-section feeds can be added later

### Search

- Pagefind: build-time indexing, client-side search UI
- No server or API required — works on static Cloudflare Pages
- Searches full post content, not just titles
- Triggered via search icon in the header, opens a modal dialog

### Table of Contents

- Auto-generated from markdown headings at build time
- Sticky sidebar with scroll-spy highlighting current section
- Collapses to inline TOC on mobile viewports

### Series Navigation

- Banner at top and bottom of series posts
- Shows series name, prev/next links, and "Part X of Y" progress
- Series landing page within `/series/` lists all parts in order

## Deployment

### Cloudflare Pages

- Astro `@astrojs/cloudflare` adapter
- Build command: `astro build`
- Output directory: `dist/`
- GitHub repo connected to Cloudflare Pages for automatic deploys on push to `main`
- Preview deployments generated on pull requests

### Build Pipeline

- `npm run dev` — local dev server with hot reload
- `npm run build` — production build
- `npm run preview` — preview production build locally
- Pagefind search index generated as a post-build step

### Content Workflow

1. Write a new `.md` file in the appropriate section folder under `src/content/`
2. Add images to a co-located `images/` subfolder
3. Push to `main` (or merge a PR)
4. Cloudflare Pages builds and deploys automatically

## Migration Plan

Existing Hugo blog content is migrated as follows:

| Source | Destination |
|--------|-------------|
| `content/posts/writeups/**` | `src/content/writeups/` |
| `content/posts/research/**` | `src/content/research/` |
| `content/posts/series/**` | `src/content/series/` |
| `content/about/about.md` | `src/pages/about.astro` |

### Migration Steps

1. Move post directories to their new locations, flattening year-based subdirectories (dates live in frontmatter)
2. Convert TOML frontmatter (`+++`) to YAML (`---`) on about page
3. Add `description` field to all posts (can be done incrementally)
4. Add `series` and `order` fields to series posts (replacing folder-based `p1/p2/p3` naming)
5. Verify all relative image paths (`./images/`) resolve correctly in new structure
6. Remove the old `content/` directory once migration is validated
