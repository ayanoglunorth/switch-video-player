import { defineConfig } from 'vite';
import { resolve } from 'path';
import JavaScriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => ({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        player: resolve(__dirname, 'player.html'),
        addVideo: resolve(__dirname, 'add-video.html'),
        settings: resolve(__dirname, 'settings.html'),
        sync: resolve(__dirname, 'sync.html'),
      },
    },
  },
  plugins: [
    mode === 'production' && JavaScriptObfuscator({
      include: ['js/**/*.js'],
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        debugProtection: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        selfDefending: false,
        splitStrings: true,
        splitStringsChunkLength: 8,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.6,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
  ].filter(Boolean),
}));
