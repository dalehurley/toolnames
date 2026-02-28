import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://toolnames.com',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    ssr: {
      noExternal: [
        '@uiw/react-md-editor',
        '@uiw/react-codemirror',
        '@uiw/react-markdown-preview',
        '@uiw/codemirror-themes',
        '@uiw/codemirror-theme-vscode',
        'file-saver',
      ],
    },
  },
});
