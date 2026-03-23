"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { safeCallbackUrl } from "@/lib/auth/safe-callback"

import { useFormState } from "../hooks"
import { loginSchema, type LoginFormData } from "../validations"
import { GoogleLoginButton } from "./google-login-button"

type LoginFormProps = {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter()
  const formState = useFormState()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const nextPath = safeCallbackUrl(callbackUrl)

  async function onSubmit(data: LoginFormData) {
    formState.startSubmit()

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const payload = (await res.json()) as { error?: string; success?: boolean }

      if (!res.ok) {
        formState.setError(
          payload.error ??
            (res.status === 401
              ? "Email hoặc mật khẩu không đúng"
              : res.status === 403
                ? "Tài khoản đã bị khóa"
                : "Đăng nhập thất bại")
        )
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      formState.setError("Không thể kết nối máy chủ. Thử lại sau.")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <div className="LoginForm mx-auto w-full max-w-md">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-xl font-bold leading-tight tracking-tight sm:text-2xl">
          Đăng nhập để tiếp tục hành trình học tập
        </h1>
        <p className="text-muted-foreground text-sm leading-normal">
          Chào mừng bạn quay lại. Nếu quên mật khẩu hoặc không đăng nhập được
          vui lòng liên hệ admin!
        </p>
      </div>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {formState.error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground font-bold" htmlFor="login-email">
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@domain.com"
            disabled={formState.isLoading}
            className="h-10 rounded-lg px-3 text-base "
            {...form.register("email")}
          />
          {form.formState.errors.email?.message && (
            <p className="text-destructive text-sm" role="alert">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-muted-foreground font-bold" htmlFor="login-password">
              Mật khẩu
            </Label>
          </div>
          <div className="relative isolate">
            <Input
              id="login-password"
              autoComplete="current-password"
              disabled={formState.isLoading}
              className="h-10 rounded-lg px-3 pe-9 text-base"
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute end-2 top-1/2 z-10 -translate-y-1/2 [&_svg]:pointer-events-auto"
              disabled={formState.isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff data-icon="inline-end" />
              ) : (
                <Eye data-icon="inline-end" />
              )}
            </Button>
          </div>
          {form.formState.errors.password?.message && (
            <p className="text-destructive text-sm" role="alert">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-lg text-base shadow-md cursor-pointer"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Đang xử lý…" : "Tiếp tục"}
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground shrink-0 text-xs font-semibold uppercase tracking-wide">
            Hoặc
          </span>
          <Separator className="flex-1" />
        </div>

        <GoogleLoginButton
          callbackUrl={nextPath}
          disabled={formState.isLoading}
          iconOnly={false}
          className="h-11 w-full justify-center rounded-lg cursor-pointer"
        />
      </div>
    </div>
  )
}
