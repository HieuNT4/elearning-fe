# 🔧 Code Quality Tools

## 1. Lefthook - Git Hooks

### `lefthook.yml`

```yaml
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
lefthook install          # Install hooks
lefthook run pre-commit   # Run manually
lefthook uninstall        # Remove hooks
git commit --no-verify    # Skip hooks
```

## 2. Commitlint - Conventional Commits

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `perf` - Performance
- `test` - Tests
- `build` - Build system
- `ci` - CI config
- `chore` - Chores
- `revert` - Revert commit

### Ví dụ

```bash
feat(auth): add login with google oauth
fix(users): resolve pagination offset issue
docs(readme): update installation instructions
refactor(api): simplify error handling logic
```

## 3. Knip - Unused Code Detection

### Các lệnh

```bash
npm run knip              # Find unused code
npm run knip:fix          # Auto-fix
npx knip --reporter symbols
```

## 4. Lint-staged

### `.lintstagedrc.js`

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
  '*.css': ['prettier --write'],
};
```

## 5. ESLint Rules

```javascript
{
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
  },
}
```
