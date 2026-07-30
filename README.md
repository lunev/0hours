# 0hours

A Chrome extension (Manifest V3) that announces the time every hour, in your choice of voice and language.

[Project page](https://lunevdev.com/projects/0hours)

## Structure

- **`app/`** — the extension itself (React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui). See [`app/README.md`](app/README.md) for setup, build, and release instructions.
- **`voices/`** — Python tooling that generates the spoken-hour audio files consumed by the extension (`app/public/audio/<lang>/<hour>.mp3`), using [edge-tts](https://github.com/rany2/edge-tts). Each language is configured in `voices/locales/<lang>.json` (voice name + hour phrases). Regenerate audio with:
  ```bash
  cd voices
  python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  python3 generate_audio.py            # all languages
  python3 generate_audio.py --lang pl  # a single language
  ```
- **`design/`** — logo and Chrome Web Store promotional assets (source `.psd` files and exported `.png`s).
