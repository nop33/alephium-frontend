#!/bin/bash
set -e

# 1. Update ESLint version
sed -i 's/"eslint": "^8.48.0"/"eslint": "^10.0.3"/g' $(find . -name "package.json" -not -path "*/node_modules/*")

# 2. Update @alephium/eslint-config package.json
cat << 'JSON' > packages/eslint-config/package.json
{
  "name": "@alephium/eslint-config",
  "license": "MIT",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./base": "./base.mjs",
    "./react": "./react.mjs"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.0",
    "@tanstack/eslint-plugin-query": "^5.66.0",
    "@typescript-eslint/eslint-plugin": "^8.24.0",
    "@typescript-eslint/parser": "^8.24.0",
    "@vercel/style-guide": "^6.0.0",
    "eslint": "^10.0.3",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.3",
    "eslint-plugin-react": "^7.37.4",
    "eslint-plugin-react-compiler": "19.0.0-beta-df7b47d-20241124",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "eslint-plugin-turbo": "^2.4.4",
    "eslint-plugin-unused-imports": "^4.1.4",
    "typescript-eslint": "^8.24.0"
  },
  "peerDependencies": {
    "eslint": "^10.0.3"
  }
}
JSON

# 3. Create base.mjs
cat << 'MJS' > packages/eslint-config/base.mjs
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
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
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
MJS

# 4. Create react.mjs
cat << 'MJS' > packages/eslint-config/react.mjs
import { resolve } from 'node:path';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactCompilerPlugin from 'eslint-plugin-react-compiler';
import baseConfig from './base.mjs';

const project = resolve(process.cwd(), 'tsconfig.json');

export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-compiler': reactCompilerPlugin,
    },
    languageOptions: {
      parserOptions: {
        project,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: true,
        JSX: true,
      },
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'warn',
      'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
      'jsx-quotes': [2, 'prefer-double'],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react-compiler/react-compiler': 'warn',
    },
  },
];
MJS

rm -f packages/eslint-config/base.js packages/eslint-config/react.js

# 5. Create app & package eslint.config.mjs files
cat << 'MJS' > packages/encryptor/eslint.config.mjs
import baseConfig from '@alephium/eslint-config/base';
export default [ { ignores: ['dist/'] }, ...baseConfig ];
MJS

cat << 'MJS' > packages/shared/eslint.config.mjs
import baseConfig from '@alephium/eslint-config/base';
export default [ { ignores: ['dist/'] }, ...baseConfig ];
MJS

cat << 'MJS' > packages/shared-react/eslint.config.mjs
import reactConfig from '@alephium/eslint-config/react';
export default [ { ignores: ['dist/'] }, ...reactConfig ];
MJS

cat << 'MJS' > packages/wallet-dapp-provider/eslint.config.mjs
import baseConfig from '@alephium/eslint-config/base';
export default [ ...baseConfig ];
MJS

cat << 'MJS' > packages/shared-crypto/eslint.config.mjs
import baseConfig from '@alephium/eslint-config/base';
export default [ { ignores: ['lib/types/', 'dist/'] }, ...baseConfig ];
MJS

cat << 'MJS' > packages/keyring/eslint.config.mjs
import baseConfig from '@alephium/eslint-config/base';
export default [ { ignores: ['dist/'] }, ...baseConfig ];
MJS

cat << 'MJS' > apps/mobile-wallet/eslint.config.mjs
import reactConfig from '@alephium/eslint-config/react';
export default [ ...reactConfig ];
MJS

cat << 'MJS' > apps/explorer/eslint.config.mjs
import reactConfig from '@alephium/eslint-config/react';
export default [ { ignores: ['node_modules/', 'build/', 'coverage/', 'src/serviceWorker.js', 'src/setupTests.js'] }, ...reactConfig ];
MJS

cat << 'MJS' > apps/desktop-wallet/eslint.config.mjs
import reactConfig from '@alephium/eslint-config/react';
import queryPlugin from '@tanstack/eslint-plugin-query';
export default [ ...reactConfig, ...queryPlugin.configs['flat/recommended'] ];
MJS

rm -f ./packages/encryptor/.eslintignore ./packages/encryptor/.eslintrc.cjs \
      ./packages/shared/.eslintignore ./packages/shared/.eslintrc.cjs \
      ./packages/shared-react/.eslintignore ./packages/shared-react/.eslintrc.cjs \
      ./packages/wallet-dapp-provider/.eslintrc.cjs \
      ./packages/shared-crypto/.eslintrc.js ./packages/shared-crypto/.eslintignore \
      ./packages/keyring/.eslintignore ./packages/keyring/.eslintrc.cjs \
      ./apps/mobile-wallet/.eslintrc.js \
      ./apps/explorer/.eslintrc.js ./apps/explorer/.eslintignore \
      ./apps/desktop-wallet/.eslintrc.js
