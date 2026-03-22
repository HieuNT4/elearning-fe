# 🔧 Code Quality Tools

[← Về mục lục](./README.md) | [← Code Patterns](./05-code-patterns.md)

---

## 1. Lefthook - Git Hooks

### `lefthook.yml`

```yaml
# https://github.com/evilmartians/lefthook

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
      stage_fixed: true

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

### Các lệnh Lefthook

```bash
# Install hooks
lefthook install

# Run all pre-commit hooks manually
lefthook run pre-commit

# Run specific hook
lefthook run commit-msg

# Skip hooks temporarily
git commit --no-verify -m "message"

# Uninstall hooks
lefthook uninstall
```

---

## 2. Commitlint - Conventional Commits

### `commitlint.config.ts`

```typescript
import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Formatting, missing semicolons, etc.
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding missing tests
        'build', // Build system or external dependencies
        'ci', // CI configuration
        'chore', // Other changes that don't modify src or test
        'revert', // Reverts a previous commit
      ],
    ],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject max length
    'subject-max-length': [2, 'always', 72],
    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // No period at the end of subject
    'subject-full-stop': [2, 'never', '.'],
    // Body max line length
    'body-max-line-length': [2, 'always', 100],
    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],
  },
};

export default config;
```

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Ví dụ commit messages

```bash
# Feature
feat(auth): add login with google oauth

# Bug fix
fix(users): resolve pagination offset issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(api): simplify error handling logic

# With body and footer
feat(dashboard): add real-time notifications

Implement WebSocket connection for live updates.
Add notification badge to header.

Closes #123
```

---

## 3. Knip - Unused Code Detection

### `knip.config.ts`

```typescript
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Entry files
  entry: ['src/app/**/*.{ts,tsx}', 'src/middleware.ts'],

  // Project files to analyze
  project: ['src/**/*.{ts,tsx}'],

  // Ignore patterns
  ignore: [
    'src/components/ui/**', // ShadcnUI components (auto-generated)
    '**/*.d.ts',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
  ],

  // Ignore dependencies
  ignoreDependencies: [
    // Peer dependencies
    'react',
    'react-dom',
    // PostCSS plugins loaded by config
    '@tailwindcss/postcss',
    // Prettier plugins
    'prettier-plugin-tailwindcss',
    // Testing utilities
    'jsdom',
  ],

  // Ignore binaries
  ignoreBinaries: ['lefthook'],

  // Plugin configurations
  next: {
    entry: [
      'next.config.{js,ts,mjs}',
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/error.tsx',
      'src/app/**/not-found.tsx',
      'src/app/api/**/route.ts',
      'src/middleware.ts',
    ],
  },

  tailwind: {
    config: ['tailwind.config.{js,ts}'],
  },

  eslint: {
    config: ['.eslintrc.json', 'eslint.config.{js,mjs}'],
  },

  typescript: {
    config: ['tsconfig.json'],
  },

  vitest: {
    config: ['vitest.config.ts'],
    entry: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  },

  commitlint: {
    config: ['commitlint.config.ts'],
  },
};

export default config;
```

### Các lệnh Knip

```bash
# Find unused code
npm run knip

# Auto-fix (remove unused exports)
npm run knip:fix

# Show detailed report
npx knip --reporter symbols

# Include dependencies analysis
npx knip --include dependencies
```

---

## 4. Lint-staged Configuration

### `.lintstagedrc.js`

```javascript
module.exports = {
  // TypeScript/JavaScript files
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON, Markdown, YAML
  '*.{json,md,yml,yaml}': ['prettier --write'],

  // CSS
  '*.css': ['prettier --write'],
};
```

---

## 5. ESLint Configuration

### `eslint.config.mjs`

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',

      // React
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import order
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
];

export default eslintConfig;
```

---

## Tiếp theo

→ [07-package-cicd.md](./07-package-cicd.md) - Package.json + CI/CD
