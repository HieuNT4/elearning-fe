import { UserHeader } from "@/components/layout/user-header"

type SiteLayoutProps = {
  children: React.ReactNode
}

/**
 * Learner-facing shell: top header with logo; excludes auth-only full pages (e.g. /login).
 */
export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="SiteLayout flex min-h-0 flex-1 flex-col">
      <UserHeader />
      {children}
    </div>
  )
}
