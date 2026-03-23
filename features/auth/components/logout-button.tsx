"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/core/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "outline",
  size = "default",
  showIcon = true,
  iconOnly = false,
  className,
}: LogoutButtonProps) {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setIsLoading(false);
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleLogout}
        disabled={isLoading}
        className={className}
        title={t("logout")}
      >
        <LogOut className={cn("h-4 w-4", isLoading && "animate-pulse")} />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {isLoading ? t("loggingOut") : t("logout")}
    </Button>
  );
}
