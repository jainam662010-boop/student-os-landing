# Student OS — Landing Page

A multi-page marketing site for **Student OS**, a free Android study app. Static HTML, CSS and vanilla JS — no build step.

🔗 **Live:** https://jainam662010-boop.github.io/student-os-landing/

## Pages

| Page | What it covers |
| --- | --- |
| `index.html` | Scroll-story landing: 3D tunnel hero, real-screenshot gallery, hoverable module strip, editorial sections |
| `focus.html` | Timestamp focus timer demo, Deep Lock shield |
| `tasks.html` | List and kanban views, priorities, XP |
| `habits.html` | Interactive streak grid and consistency stats |
| `planner.html` | Month/week/day views, exam countdowns, colour-coded blocks |
| `analytics.html` | Focus trends, subject split, insight cards |
| `privacy.html` | Data table, Deep Lock explanation, FAQ |

## Structure

```
assets/
  site.css      shared light theme, nav, footer, subpage components
  site.js       nav, mobile menu, reveals, FAQ, habit + timer demos
  skiper6.js    hoverable module strip used on the landing page
  gallery/      real Android screenshots (WebP)
  icon.svg      app icon
```

The landing page keeps its scroll-story CSS inline; everything shared lives in `site.css`. The old dark-theme `styles.css` and `main.js` are no longer linked and are kept only as reference.

All motion respects `prefers-reduced-motion`, and every page works without JavaScript except the live demos.

## Local preview

```bash
# any static server works, e.g.
npx serve .
# or
python -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

This repo is served directly by GitHub Pages from the `main` branch (root). Push to `main` and the site updates automatically.

## Links

- App: https://play.google.com/store/apps/details?id=com.jainam.studentos
- Source: https://github.com/jainam6610/student-os
- Releases (APK): https://github.com/jainam6610/student-os/releases/latest
- Privacy policy: https://studentos-privacy-hub.lovable.app

MIT licensed.
