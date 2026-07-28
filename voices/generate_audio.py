import asyncio
import edge_tts
import json
import os
import argparse

BASE_DIR = os.path.dirname(__file__)
LOCALES_DIR = os.path.join(BASE_DIR, "locales")
AUDIO_DIR = os.path.join(BASE_DIR, "audio")


async def generate(selected_lang=None):
    for filename in os.listdir(LOCALES_DIR):
        if not filename.endswith(".json"):
            continue

        lang = filename[:-5]

        # Якщо вказана мова - пропускаємо інші
        if selected_lang and lang != selected_lang:
            continue

        with open(os.path.join(LOCALES_DIR, filename), encoding="utf-8") as f:
            config = json.load(f)

        voice = config["voice"]
        hours = config["hours"]

        out_dir = os.path.join(AUDIO_DIR, lang)
        os.makedirs(out_dir, exist_ok=True)

        for number, text in hours.items():
            path = os.path.join(out_dir, f"{number}.mp3")

            print(f"{lang}: {text}")

            await edge_tts.Communicate(
                text=text,
                voice=voice,
            ).save(path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--lang",
        help="Generate only selected language (e.g. uk, en, pl, de)"
    )

    args = parser.parse_args()

    asyncio.run(generate(args.lang))

# python3 generate_audio.py
# python3 generate_audio.py --lang pl