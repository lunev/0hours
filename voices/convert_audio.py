import os
import subprocess
import argparse

BASE_DIR = os.path.dirname(__file__)
SOURCE_AUDIO_DIR = os.path.join(BASE_DIR, "audio")
APP_AUDIO_DIR = os.path.join(BASE_DIR, "..", "app", "public", "audio")

OPUS_ARGS = ["-c:a", "libopus", "-b:a", "32k", "-ar", "24000", "-ac", "1"]


def convert(src_mp3, dest_webm):
    os.makedirs(os.path.dirname(dest_webm), exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src_mp3, *OPUS_ARGS, dest_webm],
        check=True,
    )


def convert_languages(selected_lang=None):
    for lang in sorted(os.listdir(SOURCE_AUDIO_DIR)):
        lang_dir = os.path.join(SOURCE_AUDIO_DIR, lang)
        if not os.path.isdir(lang_dir):
            continue
        if selected_lang and lang != selected_lang:
            continue

        for filename in sorted(os.listdir(lang_dir)):
            if not filename.endswith(".mp3"):
                continue
            hour = filename[:-4]
            src = os.path.join(lang_dir, filename)
            dest = os.path.join(APP_AUDIO_DIR, lang, f"{hour}.webm")
            print(f"{lang}/{hour}.mp3 -> {lang}/{hour}.webm")
            convert(src, dest)


def convert_bip():
    src = os.path.join(APP_AUDIO_DIR, "bip.mp3")
    dest = os.path.join(APP_AUDIO_DIR, "bip.webm")
    print("bip.mp3 -> bip.webm")
    convert(src, dest)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--lang",
        help="Convert only selected language (e.g. uk, en, pl, de)"
    )

    args = parser.parse_args()

    convert_languages(args.lang)
    if not args.lang:
        convert_bip()

# python3 convert_audio.py
# python3 convert_audio.py --lang pl
