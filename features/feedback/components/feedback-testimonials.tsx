import { Card, CardContent } from "@/components/ui/card"

import type { FeedbackTestimonialsMessages } from "../messages/feedback-testimonials"
import type { FeedbackTestimonialItem } from "../types"

type FeedbackTestimonialsProps = {
  messages: FeedbackTestimonialsMessages
  items: FeedbackTestimonialItem[]
}

/**
 * Coursera-style testimonial grid: heading + quote cards with author line.
 */
export function FeedbackTestimonials({ messages, items }: FeedbackTestimonialsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section
      className="FeedbackTestimonials scroll-mt-[72px] w-full"
      aria-labelledby="feedback-testimonials-heading"
    >
      <div className="flex flex-col gap-2 pb-6 sm:pb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-1.5 shrink-0 bg-primary sm:h-10 sm:w-2" />
          <div className="flex min-w-0 flex-col gap-1">
            <h2
              id="feedback-testimonials-heading"
              className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl"
            >
              {messages.sectionHeading}
            </h2>
            <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {messages.sectionDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} size="sm" className="h-full shadow-sm">
            <CardContent className="flex h-full flex-col gap-4 pt-2">
              <blockquote className="flex flex-1 flex-col border-l-4 border-primary pl-4">
                <p className="text-pretty text-sm leading-relaxed text-foreground sm:text-base">
                  {item.quote}
                </p>
              </blockquote>
              <footer className="border-t border-border/80 pt-3">
                <p className="font-semibold leading-tight text-foreground">{item.authorName}</p>
                {item.role ? (
                  <p className="mt-1 text-xs leading-normal text-muted-foreground sm:text-sm">
                    {item.role}
                  </p>
                ) : null}
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
