import js from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      'reference/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals.map((config) => ({
    ...config,
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
  })),
  {
    files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  {
    files: ['apps/mobile/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
)
