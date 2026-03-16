import baseConfig from '@alephium/eslint-config/base.mjs'
import reactConfig from '@alephium/eslint-config/react.mjs'

export default [
  ...baseConfig,
  ...reactConfig,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-useless-assignment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
]
