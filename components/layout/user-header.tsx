import Link from "next/link"

import { UserButton } from "@/features/auth/components/user-button"

/**
 * Site-wide header for learner-facing pages: brand links to home.
 */
const navItems = [
  { href: "/#combo", label: "Combo" },
  { href: "/#khoa-hoc", label: "Khóa học" },
] as const

export function UserHeader() {
  return (
    <header className="UserHeader sticky top-0 z-50 flex h-[72px] w-full items-center justify-between gap-4 border-b border-border bg-white px-4 sm:px-6">
      <Link
        href="/"
        className="focus-visible:ring-ring inline-flex min-w-0 shrink-0 items-center rounded-md text-[color:var(--primary)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="khoahocso.org — Về trang chủ"
      >
        <span className="text-lg font-semibold leading-none tracking-tight sm:text-xl">
          khoahocso.org
        </span>
      </Link>

      <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4 md:gap-5">
        <nav
          className="UserHeader-nav hidden flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-medium text-foreground md:flex sm:gap-x-4"
          aria-label="Điều hướng trang chủ"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-[color:var(--primary)] hover:underline"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <UserButton />
      </div>
    </header>
  )
}
