---
name: verify
description: Typecheck, build, and lint the 0hours extension before manual testing. Use before considering a change done, since there is no CI and no test suite — this is the fastest automated check available.
---

Run these checks in order and report results. Stop and report immediately if a step fails — don't continue to the next step.

1. `npm run build` — runs `tsc -b && vite build`. Catches type errors and build failures. Output goes to `build/`.
2. `npx eslint .` — catches lint issues. Note: the ignore pattern for `dist` in `eslint.config.js` is stale (real output dir is `build/`), so this may also lint `build/` output — treat findings there as noise, not real issues.
3. `npx prettier --check .` — reports files that don't match formatting rules (double quotes, printWidth 100, trailing commas, 2-space indent). Use `npx prettier --write .` to fix.

After all steps pass, remind the user that verification here is static only — there's no automated test suite, so functional correctness still requires loading `build/` unpacked via `chrome://extensions` and testing by hand.
