import eslintConfig from '@alephium/eslint-config/base.mjs'

export default [
  ...eslintConfig,
  {
    rules: {
      'no-useless-assignment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
]
