import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CheckoutResultScreenProps = {
  variant: "error" | "cancel"
}

const contentMap: Record<CheckoutResultScreenProps["variant"], { title: string; description: string }> = {
  error: {
    title: "Thanh toán thất bại",
    description: "Đã có lỗi xảy ra trong quá trình thanh toán. Bạn có thể thử lại ngay.",
  },
  cancel: {
    title: "Bạn đã hủy thanh toán",
    description: "Giao dịch chưa được thực hiện. Bạn có thể quay lại để thanh toán bất kỳ lúc nào.",
  },
}

export function CheckoutResultScreen({ variant }: CheckoutResultScreenProps) {
  const content = contentMap[variant]
  return (
    <div className="CheckoutResultScreen mx-auto w-full max-w-2xl px-4 py-16 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild type="button">
              <Link href="/">Về trang chủ</Link>
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/checkout">Thử lại thanh toán</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
