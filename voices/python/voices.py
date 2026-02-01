import asyncio
import edge_tts
import os

async def generate_hours():
    voice = "uk-UA-PolinaNeural"
    # voice = "uk-UA-OstapNeural"
    voice_rate = "-25%"
    output_folder = "audio/uk"
    
    # Створюємо папку, якщо її немає
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for hour in range(1, 13):
        # Визначаємо правильне закінчення для кожної години
        if hour == 1:
            hour_text = "перша година"
        elif hour == 2:
            hour_text = "друга година"
        elif hour == 3:
            hour_text = "третя година"
        elif hour == 4:
            hour_text = "четверта година"
        elif hour == 5:
            hour_text = "п'ята година" # або "п'ята година"
        elif hour == 6:
            hour_text = "шоста година"
        elif hour == 7:
            hour_text = "сьома година"
        elif hour == 8:
            hour_text = "восьма година"
        elif hour == 9:
            hour_text = "дев'ята година"
        elif hour == 10:
            hour_text = "десята година"
        elif hour == 11:
            hour_text = "одинадцята година"
        elif hour == 12:
            hour_text = "дванадцята година"

        # Формуємо фінальну фразу
        full_text = f"В Києві    {hour_text}."
        
        # Назва файлу буде просто числом для зручності в JS (1.mp3, 2.mp3...)
        file_path = os.path.join(output_folder, f"{hour}.mp3")
        
        print(f"Генерую {hour}: {full_text}")
        
        communicate = edge_tts.Communicate(full_text, voice, rate=voice_rate)
        await communicate.save(file_path)

if __name__ == "__main__":
    asyncio.run(generate_hours())