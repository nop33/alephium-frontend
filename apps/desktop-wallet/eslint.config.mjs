import reactConfig from '@alephium/eslint-config/react';
import queryPlugin from '@tanstack/eslint-plugin-query';

export default [
  { ignores: ['dist-electron/', '.afterPack.js', '.signWindows.js', '.afterAllArtifactBuild.js', 'scripts/', 'src/serviceWorker.js', 'src/setupTests.js', 'eslint.config.mjs'] },
  ...reactConfig,
  ...queryPlugin.configs['flat/recommended'],
  {
    files: ['electron/preload.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];