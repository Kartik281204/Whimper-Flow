# WhimprFlow — Improvement Roadmap

Findings behind each item are in `AUDIT.md`. This roadmap deliberately does **not** repeat anything already tracked in your own `docs/BUILD-STATUS.md` "Not yet built" section or `docs/SPEC.md` M9 (Command Mode, Snippets, Styles/context-awareness, live-preview streaming, WhisperKit fallback, Windows GPU acceleration, configurable hotkey, auto-learn parity, signed installer) — that list is already good and I'm not re-deriving it. Everything below is the production-hardening layer around it: reliability, security, docs-truthfulness, and the tooling that catches regressions in all of that automatically.

## High priority — cheap, high-leverage, do first

| # | Item | Why | Rough effort |
|---|------|-----|---------------|
| H1 | Set a real CSP in `tauri.conf.json` (currently `null`) | Highest-leverage security fix given the app's Accessibility + mic + JIT privilege footprint | Hours |
| H2 | Remove the hardcoded personal signing identity from `tauri.conf.json` | Committed PII in a public repo; also breaks the build for anyone else who clones it | < 1 hour |
| H3 | Reconcile README / BUILD-STATUS.md / SPEC.md against the actual code (local-LLM status, model names, Swift→Tauri pivot) | A reviewer who catches one wrong doc claim discounts everything else you say about the project | Hours |
| H4 | Fix the clipboard data-loss bug in `paste.rs` (non-text clipboard content is discarded, not restored) | Real, reproducible, currently silent data loss | Hours |
| H5 | Surface backend errors in the UI instead of the current silent `catch {}` in `api.ts` | Right now the app cannot tell its own user when something failed | 1 day |
| H6 | Basic CI: GitHub Actions running `cargo test`, `cargo clippy`, `tsc --noEmit` on push/PR | Cheap, and would have caught H3's drift and more automatically going forward | 1 day |
| H7 | Audit and reduce the `.unwrap()` concentration in `hotkey.rs` / `win.rs`, especially anything reachable from the `extern "C"` tap callback | A panic here aborts the whole app mid-dictation with no diagnostic trail (see AUDIT §4.1) | 1–2 days |

## Medium priority — real reliability work, slightly bigger

| # | Item | Why | Rough effort |
|---|------|-----|---------------|
| M1 | Implement the sidecar isolation for the Windows hook that your own risk register (R1) already calls for | The single most impactful reliability fix for real Windows usage — Windows silently un-hooks a stalled callback with zero notification | 2–3 days |
| M2 | Wire up `tracing` (already a dependency, currently unused) in place of `eprintln!`, with a file appender in release builds | Turns "silently died, no idea why" into an actual log you can ask a user for | 1 day |
| M3 | Add an integration-style test exercising the full pipeline with fakes/fixtures (hold → mock ASR → cleanup → paste), not just isolated unit tests | Current tests are all on individually-pure pieces; nothing proves the pieces work together | 2–3 days |
| M4 | Frontend test tooling (Vitest + React Testing Library) + ESLint/Prettier | Coverage today is 100% backend, 0% frontend | 1–2 days |
| M5 | Replace fixed-sleep clipboard timing in `paste.rs` with an event-driven confirmation where feasible | Removes a class of load-dependent flakiness | 1 day |
| M6 | Consistent "saved" feedback across all Settings controls, not just API keys | Small UX fix, same root cause as H5 | Hours |

## Low priority — polish, once the above is solid

| # | Item | Why | Rough effort |
|---|------|-----|---------------|
| L1 | Move off inline `style={{}}` toward a shared style/theme layer as the Hub grows | Not a problem yet at 8 screens; will be at 15+ | 2–3 days |
| L2 | Add a short demo GIF/video to the README | This is a hold-a-key-and-speak product — a table of platform support can't show what it does; a 10-second clip can | 1 hour, highest recruiter-facing ROI on this list |
| L3 | Decide light/dark theme handling deliberately (even if the decision is "stay dark-only, on purpose") | Currently dark-only by omission rather than by choice | Hours |
| L4 | Run `cargo clippy` and work through the output | Wasn't run as part of this audit; likely surfaces more small issues | Hours |

## Suggested order

H1–H4 are each a few hours and don't depend on each other — good for a single fast pass. H6 (CI) is worth doing right after, so everything from H5 onward is checked automatically instead of by hand. H7 and M1 are the two that actually touch the highest-risk code paths (the hotkey callbacks) — worth doing back-to-back once CI exists to catch regressions in them.

Say which of these you want me to start on, or "start high priority" and I'll go H1 → H7 in order.
