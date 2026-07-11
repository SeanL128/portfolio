# Design — Sean Lindsay Portfolio

The purpose of this page is narrow and deliberate: get a visitor to a project link (and to GitHub) as fast as possible. Everything below serves that goal. It is a landing page, not a résumé — but the system is built so that more can be added later without a redesign.

---

## Principles

1. **One job.** The page points people to the work. Name, two projects, and a short set of links — nothing that competes with that.
2. **Restraint over decoration.** Minimal by intent. Empty space is a feature, not a gap to fill. No cards, no boxes, no gradients, no ornament.
3. **Content first.** Everything readable is real, static HTML. Nothing important waits on scripts, and the page is legible with styles or motion stripped away.
4. **Quietly confident.** The tone is understated. The work speaks; the layout gets out of its way.
5. **Room to grow.** The structure is a simple vertical stack of labelled sections. New sections (bio, skills, credentials) slot in using the same pattern rather than forcing a new layout.

---

## Layout

- A single centered column, roughly 660px at its widest, vertically centered in the viewport so the page reads as one calm screen rather than something to scroll.
- A strict vertical rhythm: a header block, then labelled sections separated by generous vertical space.
- **Left-aligned throughout.** Text sits on a shared left edge; only trailing meta (a project's stack, a link arrow) drifts to the right.
- Sections are introduced by a small uppercase label ("Projects", "Elsewhere"). Adding a future section means adding another label and its rows — the grammar stays identical.
- Project entries are **rows, not cards**: title, a short descriptor, and a subtle trailing arrow, divided by hairline rules. This scales cleanly from two projects to many.

---

## Type

- **One typeface: Helvetica Neue** (with Helvetica / Arial as the system fallback). A single neutral grotesque keeps the page honest and fast — no font loading, nothing trying too hard.
- **Three roles only:**
  - *Name* — larger, medium weight, tight letter-spacing. The one moment of scale.
  - *Body / project titles* — regular reading size, plain weight.
  - *Labels & meta* — small, uppercase, widely letter-spaced, muted. Used for section headers and secondary detail.
- Weight and color, not extra fonts, carry the hierarchy.

---

## Color

A near-monochrome dark palette. Contrast comes from a small number of grays, not from hue.

- **Background** — near-black, very slightly warm.
- **Primary text** — off-white (never pure white except the name and project titles).
- **Secondary text** — mid-gray for descriptors and inactive links.
- **Hairlines & dividers** — a dim gray, barely there.
- **Accent** — deliberately optional and muted. By default the accent is a low-key gray so the page reads as truly neutral; it can be tinted (a soft blue, green, or amber) to lightly color the small marks — section labels and link arrows — without changing the overall calm. The accent is a seasoning, never a headline. It is applied through a single control so a change stays consistent everywhere at once.

Light mode is possible with the same system (warm off-white paper, ink text, one restrained accent) but dark is the chosen default.

---

## Interaction & motion

- **Links** brighten to full white on hover; project rows nudge slightly to the right. That is the entire baseline interaction vocabulary — small, quick, reversible.
- **Motion is a garnish, never a gate.** Any entrance animation runs once, briefly, and then the page is fully static, selectable HTML. Repeat visitors, impatient visitors, and anyone who scrolls or types skip straight to the finished page.
- **Accessibility is non-negotiable:** reduced-motion preferences skip all motion; the page is fully usable by keyboard; focus is visible; contrast holds.

---

## Content model

The page is content-driven from a single source of truth. Facts, links, and copy are never invented in the design — where a detail isn't provided, it's shown as written rather than filled in.

Current sections:

- **Header** — name and a one-line identifier (field · school · role).
- **Projects** — each with a title, a short one-line descriptor, and an outbound link. The hero project's live/App-Store status is noted inline.
- **Elsewhere** — GitHub (the primary destination), LinkedIn, email.

Future sections would follow the same labelled-stack pattern, in rough priority order: a short bio, skills, then credentials. None of these require changing the layout, type, or color system — only adding rows.

---

## What this page deliberately avoids

- Long-form résumé content, timelines, or metrics that aren't provided.
- Multiple typefaces, accent colors, or decorative imagery.
- Cards, shadows, gradients, and container chrome.
- Any effect that slows the path to a project link or gets in the way of reading.
