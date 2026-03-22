# 🧩 Kiến trúc Modular cho Next.js + ShadcnUI

> **Hướng dẫn kiến trúc ứng dụng Next.js theo mô hình Modular - Lắp ráp như LEGO**  
> Phiên bản: Next.js 16+ | App Router | TypeScript | ShadcnUI  
> Tuân thủ: [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)

---

## 📖 Mục lục tài liệu

| File | Nội dung |
|------|----------|
| [01-architecture.md](./01-architecture.md) | Tổng quan kiến trúc 5 tầng + Tech Stack |
| [02-project-structure.md](./02-project-structure.md) | Cấu trúc thư mục chi tiết |
| [03-code-organization.md](./03-code-organization.md) | Nguyên tắc tổ chức code + Import rules |
| [04-feature-module.md](./04-feature-module.md) | Cấu trúc Feature Module + Quy tắc đặt tên |
| [05-code-patterns.md](./05-code-patterns.md) | Code Patterns + Examples |
| [06-code-quality.md](./06-code-quality.md) | Lefthook, Commitlint, Knip, ESLint |
| [07-package-cicd.md](./07-package-cicd.md) | Package.json + CI/CD Workflow |
| [08-examples.md](./08-examples.md) | Ví dụ thực tế + Rules cho AI/Cursor |

---

## 🎯 Quick Start

### Đọc theo thứ tự nếu mới bắt đầu:

1. **[Architecture](./01-architecture.md)** - Hiểu kiến trúc 5 tầng
2. **[Project Structure](./02-project-structure.md)** - Xem cấu trúc thư mục
3. **[Code Organization](./03-code-organization.md)** - Nắm quy tắc import
4. **[Feature Module](./04-feature-module.md)** - Tạo feature đầu tiên

### Reference nhanh khi code:

- **[Code Patterns](./05-code-patterns.md)** - Copy-paste patterns
- **[Code Quality](./06-code-quality.md)** - Setup tools
- **[Examples](./08-examples.md)** - Xem ví dụ thực tế

---

## ✨ Ưu điểm kiến trúc

- ✅ **Modular**: Tháo/gắn features như LEGO
- ✅ **Scalable**: Dễ mở rộng và bảo trì
- ✅ **Team-friendly**: Nhiều người làm không xung đột
- ✅ **Type-safe**: TypeScript strict mode
- ✅ **Next.js compliant**: Tuân thủ chuẩn Next.js

---

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────────────────────────┐
│  APP (Next.js App Router)               │  ← Entry point
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  FEATURES (Business Modules)            │  ← Business logic
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  SHARED (Cross-Feature Code)            │  ← Reusable
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  CORE (Foundation)                      │  ← Infrastructure
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  COMPONENTS/UI (ShadcnUI)               │  ← UI primitives
└─────────────────────────────────────────┘
```

Chi tiết: [01-architecture.md](./01-architecture.md)
