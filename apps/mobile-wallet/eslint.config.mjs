import reactConfig from '@alephium/eslint-config/react';

export default [
  { ignores: ['app.config.js', 'babel.config.js', 'metro.config.js', 'eslint.config.mjs'] },
  ...reactConfig,
  {
    files: ['jestSetupFile.ts', 'shim.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];