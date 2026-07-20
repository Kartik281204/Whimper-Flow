# WhimprFlow

A **local-first, cross-platform voice dictation app** — hold a key, speak, and clean text lands wherever your cursor is. Speech is transcribed on-device with Whisper and cleaned up (filler removal, self-corrections, punctuation, lists/newlines) by a local LLM, with an optional cloud path. It re-creates the workflow of a Wispr-Flow-style dictation tool from scratch, with its own name, palette, and code.

> ⚠️ **This is a proof of concept, vibe-coded in a few hours.** It works and the core loop is real, but it is rough and needs a lot of polish, testing, and hardening before it's anything like production quality. Treat it as a starting point, not a finished product.

---

## Platform status

| Platform | Status |
|----------|--------|
| **macOS 14+** | **Built and working** — developed and tested locally (Apple Silicon). |
| **Windows 10/11** | **Built and working** — compiles and runs on real Windows 11 (MSVC). Push-to-talk (hold **Right Ctrl**), Whisper ASR, clipboard+`SendInput` paste, and cloud cleanup (OpenAI or any OpenAI-compatible API, e.g. OpenRouter) are verified end-to-end. Auto-learn dictionary capture is still macOS-only; the local (on-device) LLM cleanup worker builds but is CPU-only for now (no CUDA/Vulkan yet). |

Both platforms are build-from-source only for now — there's no signed installer/release pipeline yet, so `git clone` + the steps below is the way to run it on either OS.

---

## What's in it

- **On-device ASR** — Whisper (via `whisper.cpp`), running on the GPU. Ships a small English model by default; larger models are auto-preferred if present.
- **Local LLM cleanup** — Qwen3-4B-Instruct (via `llama.cpp`) runs as a separate worker process and cleans the transcript: removes fillers, resolves spoken self-corrections ("meet at 2… no wait, 3" → "3"), applies spoken punctuation, and formats lists/paragraphs. Deterministic gates guard against over-editing, with a raw-transcript fallback.
- **Optional cloud cleanup** — OpenAI (default) / Anthropic, behind one trait. Keys are stored in the OS keychain (macOS Keychain / Windows Credential Manager), **never in a file**.
- **Floating pill UI** — a small always-on-top bar showing idle / recording / processing states.
- **Personal dictionary + auto-learn** — teach it names and terms; on macOS a post-paste Accessibility observer watches for a one-word correction and learns it automatically (conservative filters to avoid junk). *Auto-learn capture is macOS-only so far.*
- **Usage stats** — words dictated, words-per-minute, day streak, time saved, 7-day activity, all stored locally.

## Architecture

Tauri v2 (Rust core + React/TypeScript webviews). Platform-agnostic logic lives in `crates/whimpr-core` (state machine, cleanup prompts/gates, dictionary, stats). ASR, audio, and the LLM worker are separate crates. The Tauri app in `src-tauri/` hosts the UI and wires the native hotkey/injection per platform (`hotkey.rs` on macOS, `win.rs` on Windows).

```
crates/
  whimpr-core/       state machine, cleanup (prompts/gates/levels), dictionary, stats
  whimpr-asr/        Whisper ASR
  whimpr-audio/      mic capture + resampling
  whimpr-cleanup/    OpenAI / Anthropic cloud providers
  whimpr-llm-worker/ local llama.cpp cleanup worker (separate process)
src-tauri/           Tauri shell: hotkey/paste/autolearn (macOS), win.rs (Windows)
ui/                  React Hub + overlay pill
docs/                spec, architecture notes, research
```

## Build (macOS)

Requires Rust (stable), Node + pnpm, and the Xcode command-line tools.

```bash
cd ui && pnpm install && cd ..
# Dev:
./dev.sh
# Or a signed .app bundle:
ui/node_modules/.bin/tauri build --bundles app
```

Models are **not** committed (they're multi-GB). Place them under
`~/Library/Application Support/WhimprFlow/models/` (macOS) —
a Whisper `ggml-*.en.bin` and a Qwen GGUF for local cleanup.

## Build (Windows)

Requires Rust (stable, MSVC toolchain), [CMake](https://cmake.org/download/), LLVM/clang
(for `bindgen` — set `LIBCLANG_PATH` to its `bin/` dir if it isn't auto-detected), the
**Visual Studio Build Tools** (Desktop development with C++ workload), and Node + pnpm.

```powershell
cd ui; pnpm install; cd ..
# Dev (starts the Vite UI server + the app with hot reload):
ui\node_modules\.bin\tauri.CMD dev
# Or a release build:
ui\node_modules\.bin\tauri.CMD build
```

Place models under `%APPDATA%\WhimprFlow\models\` — a Whisper `ggml-*.en.bin`
(e.g. `ggml-base.en.bin` from
[huggingface.co/ggerganov/whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp))
and, optionally, a Qwen GGUF for local (offline) cleanup. No local LLM model?
Set Cleanup Engine to **OpenAI** in the Hub's Settings pane and point the base URL at
any OpenAI-compatible API — for example `https://openrouter.ai/api/v1` for
[OpenRouter](https://openrouter.ai), with your OpenRouter key pasted into the
"OpenAI API key" field.

Push-to-talk defaults to **Right Ctrl** (hold to record, release to paste) — the
Windows analogue of Wispr Flow's own `Ctrl+Win` default; a configurable hotkey is
planned but not wired up yet.

The Windows GPU backend for Whisper/llama.cpp is CPU-only for now (the macOS build
uses Metal); CUDA/Vulkan feature flags can be added in `crates/whimpr-asr/Cargo.toml`
and `crates/whimpr-llm-worker/Cargo.toml` for anyone wanting to pick that up.

## Notes & disclaimers

- **Not affiliated with, endorsed by, or connected to Wispr Flow or any other product.** WhimprFlow is an independent, from-scratch reimplementation of the dictation workflow, with its own name, branding, colors, strings, and code. No third-party code or assets are included.
- **Proof of concept.** Rushed, under-tested, and missing plenty (auto-learn is macOS-only and conservative, no installer/notarization/signing pipeline on either OS, error handling is thin). Contributions and fixes welcome.
- **Privacy.** ASR and default cleanup run on-device. Cloud cleanup is opt-in and only sends the transcript (not audio) to the provider you choose. API keys never touch disk in plaintext.

## License

MIT — see [LICENSE](LICENSE).
