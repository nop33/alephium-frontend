import baseConfig from '@alephium/eslint-config/base.mjs'
import reactConfig from '@alephium/eslint-config/react.mjs'

export default [
  ...baseConfig,
  ...reactConfig,
  {
    rules: {
      'no-useless-assignment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'turbo/no-undeclared-env-vars': 'off'
    }
  }
]
