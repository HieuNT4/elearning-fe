# 📦 Package.json + CI/CD

[← Về mục lục](./README.md) | [← Code Quality](./06-code-quality.md)

---

## Package.json

```json
{
  "name": "next-auth-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "knip": "knip",
    "knip:fix": "knip --fix",
    "prepare": "lefthook install"
  },
  "dependencies": {
    "next": "^16.1.4",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",

    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-toast": "^1.2.14",

    "@hookform/resolvers": "^5.0.1",
    "react-hook-form": "^7.56.0",
    "zod": "^3.25.23",

    "@tanstack/react-query": "^5.80.6",
    "@tanstack/react-table": "^8.21.3",

    "zustand": "^5.0.5",

    "next-auth": "^5.0.0-beta.25",

    "next-themes": "^0.4.6",

    "lucide-react": "^0.511.0",

    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",

    "date-fns": "^4.1.0",
    "sonner": "^2.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.15.21",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",

    "typescript": "^5.8.3",

    "tailwindcss": "^4.1.7",
    "@tailwindcss/postcss": "^4.1.7",

    "eslint": "^9.27.0",
    "eslint-config-next": "^15.3.2",
    "@eslint/eslintrc": "^3.3.1",

    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.12",

    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
    "lefthook": "^1.11.13",
    "knip": "^5.61.2",
    "lint-staged": "^16.0.0",

    "vitest": "^3.2.1",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^4.5.1",
    "jsdom": "^26.1.0"
  }
}
```

---

## 🚀 CI/CD Integration

### `.github/workflows/code-quality.yml`

```yaml
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
        with:
          fetch-depth: 0 # For commitlint

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Format check
        run: npm run format:check

      - name: Knip (unused code)
        run: npm run knip

      - name: Commitlint (PR commits)
        if: github.event_name == 'pull_request'
        run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose

      - name: Test
        run: npm run test -- --run

      - name: Build
        run: npm run build
```

---

## NPM Scripts Reference

| Script | Mô tả |
|--------|-------|
| `dev` | Chạy dev server với Turbopack |
| `build` | Build production |
| `start` | Chạy production server |
| `lint` | Kiểm tra ESLint |
| `lint:fix` | Tự động fix ESLint errors |
| `format` | Format code với Prettier |
| `format:check` | Kiểm tra format |
| `typecheck` | Kiểm tra TypeScript |
| `test` | Chạy tests với Vitest |
| `test:ui` | Chạy tests với UI |
| `knip` | Tìm unused code |
| `knip:fix` | Tự động xóa unused exports |
| `prepare` | Install Lefthook hooks |

---

## Tiếp theo

→ [08-examples.md](./08-examples.md) - Ví dụ thực tế + Rules cho AI
