import { resolve } from 'node:path';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
      'unused-imports': unusedImportsPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      turbo: turboPlugin,
    },
    languageOptions: {
      globals: {
        browser: true,
        node: true,
        jasmine: true,
        jest: true,
      },
    },
    rules: {
      ...prettierConfig.rules,
      'arrow-body-style': [2, 'as-needed'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-use-before-define': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'simple-import-sort/imports': 'warn',
      'no-duplicate-imports': 'warn',
      quotes: [1, 'single', { avoidEscape: true }],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      'turbo/no-undeclared-env-vars': 'error',
    },
  }
);
