# Portfolio Build — Sean Lindsay

## Mission
Build and prepare-to-deploy a personal developer portfolio website for **Sean Lindsay** in a single autonomous run. The audience is technical recruiters and hiring managers at top AI and tech companies. The site must look **unique and genuinely impressive** — something a recruiter remembers — while staying **fast, accessible, and easy to use**. Impressive is not the same as gimmicky: no visual effect should ever get in the way of reading the content or navigating the site. When an effect competes with usability, usability wins.

## Source of truth
- **Copy, facts, links, project details:** `content.md`. Do not invent facts, metrics, dates, or claims that are not in that file. Where a detail isn't given (e.g. an acronym's full expansion), present it exactly as written rather than filling in a guess.
- **Aesthetic and UX direction:** none provided — design from scratch.

Read `content.md` fully before writing any code.

## Tech and deploy
- **Framework:** Astro, static output, TypeScript. Use client-side interactivity (Astro islands) only where a component genuinely needs it — this is a content site, keep the JS minimal.
- **Styling:** your choice (vanilla CSS or Tailwind), but keep the bundle lean and the site fast.
- **Host:** Cloudflare Pages. Produce a deploy-ready `dist/` plus the Cloudflare Pages build config (e.g. `wrangler.toml`), and document the exact deploy command in the README.
- **Publishing:** run the final publish only if Cloudflare/wrangler authentication is already present in the environment. Otherwise, stop at deploy-ready and print the exact command for Sean to run. Do not enter, request, or store credentials.

## Autonomy — this is a one-shot, unattended run
- You are operating autonomously. Sean is not watching and cannot answer questions mid-run, so asking "Want me to…?" or "Shall I…?" will only block the work. Never stop to ask.
- For any reversible decision that follows from this brief — design choices, layout, section order, copy phrasing within the given facts, technical details — decide and proceed. When you have enough to act, act. If you're weighing options, pick one with a short rationale in your notes; don't narrate a survey of paths you won't take.
- Pause only for a genuinely destructive or irreversible action, or for something only Sean can provide (for example, missing credentials for the final publish). If you hit one of those, complete everything else first, then stop with a clear note about the single blocker.
- Before ending your turn, check your last message. If it's a plan, a question, or an "I'll now do X" promise, do that work now instead. End only when the site is built, verified, and deploy-ready.

## Scope discipline
- Don't over-build. Do the simplest thing that looks great and works. No backend, no CMS, no database, no speculative features, no premature abstraction. Static content, sourced from `content.md`.
- Only real content in the final build: no lorem ipsum, no placeholder links. Every link in `content.md` is real — use them exactly.
- No resume/CV link or download (none is provided for now).

## Verify as you build
- Set a check interval (e.g. after each major section). At each interval, verify against this brief and the two source files using a fresh-context subagent: does it build (`npm run build`), render correctly, work responsively on mobile and desktop, navigate by keyboard, and load without console errors?
- Ground every progress claim in an actual tool result. Only report work you can point to evidence for. If the build fails, say so with the output rather than glossing it.
- Before declaring done, run the production build and confirm: every link resolves; layout holds at ~375px wide and at desktop widths; semantic landmarks, alt text, visible focus states, and AA-level contrast are all present; and `prefers-reduced-motion` is respected.

## Definition of done
1. Astro site builds cleanly to `dist/`.
2. All content from `content.md` is present and accurate; every link works.
3. Site is responsive, accessible, and fast; motion respects `prefers-reduced-motion`.
4. Cloudflare Pages config and README deploy instructions are in place — deployed if auth was present, otherwise deploy-ready with the command printed.

## Build notes
Keep a `BUILD_NOTES.md` as you go: one decision or lesson per line with a short note on why it mattered. Update existing entries rather than duplicating them. This is for continuity, not narration.

You have ample context and time. Do not stop, summarize, or suggest a fresh session on account of context limits — continue until the site is done.
