/**
 * Global reference to the currently playing audio object.
 * This allows us to stop or reset playback from anywhere in the script.
 */
let currentAudio = null;

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "play_sequence") {
    // 1. Stop any current playback to prevent overlapping sounds
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Get volume levels (normalized between 0.0 and 1.0)
    const volume = message.volume !== undefined ? message.volume : 1;

    // 2. Initialize Audio objects
    const bip = new Audio("audio/bip.mp3");
    const voice = new Audio(message.voicePath);

    // Apply volume settings
    bip.volume = volume;
    voice.volume = volume;

    // 3. Sequence logic: play the voice file once the bip finishes
    bip.onended = () => {
      console.log("BIP finished. Playing voice file:", message.voicePath);
      currentAudio = voice; // Update reference to the second part of the sequence
      voice.play().catch((err) => {
        console.error("Voice playback failed:", err);
      });
    };

    // 4. Error handling for audio loading
    const handleError = (e) => {
      console.error("Failed to load audio file:", e.target.src);
    };
    bip.onerror = handleError;
    voice.onerror = handleError;

    // 5. Start the playback sequence
    console.log(`Starting sequence. Volume: ${Math.round(volume * 100)}%`);
    currentAudio = bip; // Initial reference points to the bip sound

    bip.play().catch((err) => {
      console.warn("BIP playback failed, skipping directly to voice...", err);
      currentAudio = voice;
      voice.play();
    });
  }
});
