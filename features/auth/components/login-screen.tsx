import { LoginForm } from "./login-form"
import { LoginMarketingPanel } from "./login-marketing-panel"

type LoginScreenProps = {
  callbackUrl?: string
}

/**
 * Split login: marketing (left) + form (right) on large screens only.
 * Mobile/tablet: form full width, marketing hidden.
 */
export function LoginScreen({ callbackUrl }: LoginScreenProps) {
  return (
    <div className="LoginScreen grid min-h-svh w-full grid-cols-1 bg-white lg:grid-cols-2">
      <div className="hidden lg:block">
        <LoginMarketingPanel />
      </div>
      <section className="LoginScreen-form flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </div>
  )
}
