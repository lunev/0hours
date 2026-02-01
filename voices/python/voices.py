import asyncio
import edge_tts
import os

VOICES = {
    "uk": "uk-UA-PolinaNeural",
    "en": "en-US-GuyNeural"
}

async def generate_hours():
    base_path = os.path.join(os.path.dirname(__file__), "..", "audio")
    voice_rate = "-25%"

    uk_hours = {
        1: "Перша година",
        2: "Друга година",
        3: "Третя година",
        4: "Четверта година",
        5: "П'ята година",
        6: "Шоста година",
        7: "Сьома година",
        8: "Восьма година",
        9: "Дев'ята година",
        10: "Десята година",
        11: "Одинадцята година",
        12: "Дванадцята година"
    }

    for lang, voice in VOICES.items():
        folder = os.path.join(base_path, lang)
        os.makedirs(folder, exist_ok=True)
        
        for hour in range(1, 13):
            if lang == "uk":
                text = uk_hours[hour]
            else:
                text = f"{hour} o'clock"
                
            output = os.path.join(folder, f"{hour}.mp3")
            
            print(f"Saving {lang} {hour}: '{text}'...")
            await edge_tts.Communicate(text, voice).save(output)

if __name__ == "__main__":
    asyncio.run(generate_hours())