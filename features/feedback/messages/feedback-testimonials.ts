export type FeedbackTestimonialsLocale = "en" | "ja" | "vi"

export type FeedbackTestimonialsMessages = {
  sectionHeading: string
  sectionDescription: string
}

export const feedbackTestimonialsMessages: Record<
  FeedbackTestimonialsLocale,
  FeedbackTestimonialsMessages
> = {
  vi: {
    sectionHeading: "Học viên đang đạt được gì nhờ học tập",
    sectionDescription:
      "Chia sẻ thật từ người đã và đang học cùng khoahocso.org — linh hoạt thời gian, học phí hợp lý.",
  },
  en: {
    sectionHeading: "What learners achieve through studying",
    sectionDescription:
      "Real stories from people learning with khoahocso.org — flexible schedules and fair pricing.",
  },
  ja: {
    sectionHeading: "学習を通じて受講生が手にしているもの",
    sectionDescription:
      "khoahocso.org で学ぶ方の声 — 柔軟な時間と手頃な料金。",
  },
}

export const feedbackTestimonialsMessagesVi = feedbackTestimonialsMessages.vi
