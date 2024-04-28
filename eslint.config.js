import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginNext from '@next/eslint-plugin-next'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/server/**/*.ts', 'packages/server/**/*.tsx'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@next/next': eslintPluginNext,
    },
    rules: {
      ...eslintPluginReact.configs['jsx-runtime'].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginNext.configs.recommended.rules,
      ...eslintPluginNext.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'error',
      '@next/next/no-html-link-for-pages': ['error', 'packages/server/pages/'],
    },
  },
  {
    files: ['packages/client/**/*.tsx', 'packages/client/**/*.ts'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
