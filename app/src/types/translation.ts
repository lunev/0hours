export type Translation = {
  message: {
    activateHint: string;
    nextChime: string;
  };
  settings: {
    title: string;
    language: string;
    quietHours: string;
    muteHint: string;
    theme: string;
    languageLabel: string;
    volume: string;
  };
  actions: {
    activate: string;
    deactivate: string;
    save: string;
    cancel: string;
    play: string;
    stop: string;
  };
};
