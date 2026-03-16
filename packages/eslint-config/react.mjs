import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        React: true,
        JSX: true
      }
    },
    settings: {
      react: {
        pragma: 'React',
        version: 'detect'
      }
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-quotes': [2, 'prefer-double'],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }]
    }
  }
];
