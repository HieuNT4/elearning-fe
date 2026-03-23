import Image from "next/image"
import Link from "next/link"

import { UserButton } from "@/features/auth/components/user-button"

/**
 * Site-wide header for learner-facing pages: brand logo links to home.
 */
export function UserHeader() {
  return (
    <header className="UserHeader sticky top-0 z-50 w-full border-b border-border bg-white flex h-[72px] items-center justify-between gap-4 px-[24px]">
        <Link
          href="/"
          className="focus-visible:ring-ring inline-flex min-w-0 shrink-0 items-center rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label="Về trang chủ"
        >
          <Image
            src="/logo.png"
            alt=""
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <UserButton />
    </header>
  )
}
