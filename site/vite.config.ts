import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Served from https://lunev.github.io/0hours/, so assets need the repo name as base.
export default defineConfig({
  base: '/0hours/',
  plugins: [react(), tailwindcss()],
});
