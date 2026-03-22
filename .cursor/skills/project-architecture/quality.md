# Code Quality Tools

## 1. Lefthook - Git Hooks

```yaml
# lefthook.yml
assert_lefthook_installed: true

pre-commit:
  parallel: true
  commands:
    lint-staged:
      glob: '*.{ts,tsx,js,jsx}'
      run: npx lint-staged
    typecheck:
      glob: '*.{ts,tsx}'
      run: npm run typecheck
    knip:
      run: npm run knip -- --no-exit-code

pre-push:
  parallel: true
  commands:
    test:
      run: npm run test -- --run
    build:
      run: npm run build

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

### Commands

```bash
lefthook install          # Install hooks
lefthook run pre-commit   # Run manually
git commit --no-verify    # Skip hooks
```

## 2. Commitlint

```typescript
// commitlint.config.ts
import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};

export default config;
```

### Commit Format

```
<type>(<scope>): <subject>

feat(auth): add google oauth login
fix(users): resolve pagination issue
docs(readme): update installation guide
```

## 3. Knip - Unused Code

```typescript
// knip.config.ts
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/app/**/*.{ts,tsx}', 'src/middleware.ts'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['src/components/ui/**', '**/*.d.ts', '**/*.test.{ts,tsx}'],
  ignoreDependencies: ['react', 'react-dom', '@tailwindcss/postcss', 'jsdom'],
};

export default config;
```

### Commands

```bash
npm run knip          # Find unused code
npm run knip:fix      # Auto-fix
```

## 4. Lint-staged

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

## 5. ESLint

```javascript
// eslint.config.mjs
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      }],
    },
  },
];
```

## 6. CI/CD Workflow

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check
      - run: npm run knip
      - run: npm run test -- --run
      - run: npm run build
```
