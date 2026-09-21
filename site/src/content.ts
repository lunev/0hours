export type Content = {
  id: string;
  shortName: string;
  name: string;
  tagline: string;
  hero: { width: number; height: number };
  repoUrl: string;
  narrative: { heading: string; body: string[] };
  steps: { title: string; body: string }[];
  features: string[];
};

export const content: Content = {
  id: 'gjkpcdjhkpjjehejhieaibmekliiemic',
  shortName: '0hours',
  name: '0hours — Talking Clock & Hourly Time Announcer',
  tagline:
    'A quiet, spoken pulse for your day — like a digital grandfather clock for your workspace.',
  hero: { width: 1280, height: 800 },
  repoUrl: 'https://github.com/lunev/0hours',
  narrative: {
    heading: 'For anyone who loses track of time',
    body: [
      "In a world of infinite scroll and deep-work sessions, it's remarkably easy to look up and realize three hours have vanished. 0hours solves this through auditory awareness, not another visual distraction — a quiet anchor that keeps you grounded in real time.",
      'No pop-ups, no visual clutter — 0hours lives quietly in the background and only speaks when the hour turns, with fully customizable Quiet Hours so it never interrupts sleep or focus, plus Muted Pages so it automatically stays silent on sites you list, like video calls. Choose a natural voice across 23 languages, from English and Spanish to Japanese, Arabic, and Urdu, for a warmer experience than a mechanical beep.',
    ],
  },
  steps: [
    {
      title: 'Install and forget',
      body: 'Add 0hours to Chrome. There is nothing to configure to get started — it just works.',
    },
    {
      title: 'Choose your voice and language',
      body: 'Pick from natural voices across 23 languages and set the volume to a level that feels right for your space.',
    },
    {
      title: 'Stay aware, gently',
      body: 'At the top of each hour, a short spoken announcement lets you know where you are in the day, with a live countdown showing exactly how much time is left until the next chime — and a toolbar badge showing at a glance when it is silenced, and why.',
    },
  ],
  features: [
    'Hourly voice announcements in 23 languages',
    'Live countdown showing time left until the next chime',
    'Customizable Quiet Hours so it never interrupts sleep or focus',
    'Muted Pages — automatically stays silent on sites you list, like video calls',
    'Toolbar badge shows at a glance when the chime is silenced, and why',
    'Clean, minimalist interface',
    'Zero tracking — everything runs locally in your browser',
  ],
};
