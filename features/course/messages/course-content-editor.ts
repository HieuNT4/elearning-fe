export type CourseContentEditorLocale = "vi" | "en" | "ja"

export const courseContentEditorMessages = {
  vi: {
    editChapterTable: "Sửa bảng chương",
    cancelQuickEdit: "Hủy chỉnh sửa",
    importChapter: "Lưu cả chương (import)",
    importHint:
      "Mỗi lần import tạo một chương mới trên server. Tránh bấm hai lần nếu không muốn trùng.",
    importConfirm:
      "Xác nhận gửi import? Backend sẽ tạo một chương mới kèm bài học và học phần theo bảng hiện tại.",
    addLessonRow: "Thêm bài học",
    addPartRow: "Thêm học phần",
    removeLessonRow: "Xóa bài",
    removePartRow: "Xóa dòng",
    chapterTitleLabel: "Tên chương",
    lessonTitleLabel: "Tên bài học",
    partTitlePlaceholder: "Tên học phần",
    videoUrlPlaceholder: "Video URL",
    documentUrlPlaceholder: "Tài liệu URL",
    previewLabel: "Preview",
    mustKeepOnePart: "Mỗi bài cần ít nhất một học phần.",
    addAtLeastOneLesson: "Thêm ít nhất một bài học để có thể import.",
  },
  en: {
    editChapterTable: "Edit chapter table",
    cancelQuickEdit: "Cancel editing",
    importChapter: "Save whole chapter (import)",
    importHint:
      "Each import creates a new chapter on the server. Avoid double-submitting.",
    importConfirm:
      "Send import? The server will create a new chapter with lessons and parts from this table.",
    addLessonRow: "Add lesson",
    addPartRow: "Add part",
    removeLessonRow: "Remove lesson",
    removePartRow: "Remove row",
    chapterTitleLabel: "Chapter title",
    lessonTitleLabel: "Lesson title",
    partTitlePlaceholder: "Part title",
    videoUrlPlaceholder: "Video URL",
    documentUrlPlaceholder: "Document URL",
    previewLabel: "Preview",
    mustKeepOnePart: "Each lesson needs at least one part.",
    addAtLeastOneLesson: "Add at least one lesson before importing.",
  },
  ja: {
    editChapterTable: "チャプターテーブルを編集",
    cancelQuickEdit: "編集をキャンセル",
    importChapter: "チャプター全体を保存（インポート）",
    importHint:
      "インポートのたびにサーバーに新しいチャプターが作成されます。二重送信に注意してください。",
    importConfirm:
      "インポートを送信しますか？サーバーはこの表の内容で新しいチャプター・レッスン・パートを作成します。",
    addLessonRow: "レッスンを追加",
    addPartRow: "パートを追加",
    removeLessonRow: "レッスンを削除",
    removePartRow: "行を削除",
    chapterTitleLabel: "チャプタータイトル",
    lessonTitleLabel: "レッスンタイトル",
    partTitlePlaceholder: "パート名",
    videoUrlPlaceholder: "動画URL",
    documentUrlPlaceholder: "資料URL",
    previewLabel: "プレビュー",
    mustKeepOnePart: "各レッスンには少なくとも1つのパートが必要です。",
    addAtLeastOneLesson: "インポートする前に少なくとも1つのレッスンを追加してください。",
  },
} as const

export const courseContentEditorMessagesVi = courseContentEditorMessages.vi
