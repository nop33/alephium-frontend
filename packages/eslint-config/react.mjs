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
        version: '19.1.0',
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
      'react/display-name': 'off',
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
