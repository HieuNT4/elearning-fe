"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        onClick={() => setIsVisible((v) => !v)}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}

export { PasswordInput }
