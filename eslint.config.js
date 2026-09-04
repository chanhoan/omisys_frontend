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
      // 디자인 시안(브라우저 목업)과 Workflow 하네스 스크립트는 앱 빌드 대상이 아니다.
      // .claude 는 워크플로 스크립트만 제외한다 — 그 아래 앱 코드가 생기면 린트를 계속 받도록.
      '.design/**',
      '.claude/workflows/**',
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
