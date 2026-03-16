import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import header from 'eslint-plugin-header';
import turboPlugin from 'eslint-plugin-turbo';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/types/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/public/**',
      '**/out/**',
      '**/src/serviceWorker.js',
      '**/src/setupTests.js'
    ]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      header: header,
      turbo: turboPlugin
    },
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jasmine,
        ...globals.jest
      }
    },
    rules: {
      'arrow-body-style': [2, 'as-needed'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-use-before-define': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'simple-import-sort/imports': 'warn',
      'no-duplicate-imports': 'warn',
      'header/header': 'off',
      quotes: [1, 'single', { avoidEscape: true }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      'turbo/no-undeclared-env-vars': 'error'
    }
  }
);
