import { defineConfig, sharpImageService } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://underdunn.com',
  image: {
    service: sharpImageService(),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'dark-plus',
      },
    },
  },
});
