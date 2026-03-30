import { Check } from "lucide-react"
import Image from "next/image"

/** Hero illustration — `public/images/banner-hero-app-team.webp` (team building a mobile app). */
const BANNER_HERO_IMAGE = "/images/banner-hero-app-team.webp"
const BANNER_HERO_WIDTH = 640
const BANNER_HERO_HEIGHT = 640

const bannerBenefits = [
  "Học online, xem video tốc độ cao, phát ổn định",
  "Nội dung cập nhật liên tục",
  "Bảo hành trọn đời sau khi mua",
  "Khoá lẻ từ 59.000đ",
  "Combo từ 199.000đ",
] as const

/**
 * Site hero: primary band, 1140px content, copy left / illustration right on large screens.
 */
export function Banner() {
  return (
    <div
      className="Banner relative isolate w-full overflow-hidden bg-primary px-4 py-10 text-primary-foreground sm:px-6 sm:py-6 md:py-14"
      role="region"
      aria-label="Language courses promotional banner"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.14] via-transparent to-black/25" />
        <div
          className="absolute inset-0 opacity-[0.4] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]"
        />
        <div className="absolute -top-[18%] right-[-8%] h-[min(380px,60vw)] w-[min(380px,85vw)] rounded-full bg-white/15 blur-[72px]" />
        <div className="absolute -bottom-[22%] left-[-12%] h-[min(300px,55vw)] w-[min(340px,90vw)] rounded-full bg-white/10 blur-[56px]" />
        <div className="absolute right-[15%] top-[35%] h-px w-[40%] max-w-md rotate-[-12deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-8 md:flex-row md:items-center md:gap-10 md:gap-x-12">
        <div className="flex w-full flex-1 flex-col items-center text-center md:max-w-[min(100%,520px)] md:items-start md:text-left">
          <div className="max-w-4xl text-balance">
            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              <span className="inline-block sm:inline">Khoá học ngoại ngữ</span>
              <br />
              <span className="inline-block sm:inline">Chỉ từ 59.000đ</span>
            </h2>
            <ul
              className="BannerBenefits mx-auto mt-4 flex w-full max-w-xl flex-col gap-2.5 text-left sm:mt-5 sm:gap-3 md:mx-0"
              aria-label="Lợi ích khi học tại khoahocso.org"
            >
              {bannerBenefits.map((line) => (
                <li
                  key={line}
                  className="flex gap-2.5 text-pretty text-sm leading-relaxed sm:text-base md:text-lg"
                >
                  <Check
                    className="mt-0.5 size-5 shrink-0 stroke-[2.5] text-primary-foreground opacity-95"
                    aria-hidden
                  />
                  <span className="opacity-95">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden w-full shrink-0 justify-center md:flex md:w-[min(100%,440px)] lg:w-[479px]">
          <Image
            src={BANNER_HERO_IMAGE}
            alt="Illustration of a team collaborating to build a mobile app on a smartphone"
            width={BANNER_HERO_WIDTH}
            height={BANNER_HERO_HEIGHT}
            priority
            sizes="(min-width: 768px) min(479px, 40vw), 0px"
            className="h-auto w-full max-w-[679px] object-contain object-bottom"
          />
        </div>
      </div>
    </div>
  )
}
