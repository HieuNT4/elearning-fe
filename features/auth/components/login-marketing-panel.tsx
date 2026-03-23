import Image from "next/image"

/**
 * Left column (lg+ only): illustration on white (matches reference layout).
 */
export function LoginMarketingPanel() {
  return (
    <aside className="LoginMarketingPanel flex min-h-svh w-full items-center justify-center bg-white px-6 py-10 lg:px-10 lg:py-12">
      <Image
        src="/login-illustration.png"
        alt="Illustration of Japanese language learning and culture"
        width={900}
        height={900}
        className="h-auto max-h-[min(88svh,820px)] w-full max-w-2xl object-contain"
        priority
      />
    </aside>
  )
}
