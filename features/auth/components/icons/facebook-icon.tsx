import { cn } from "@/core/lib/utils";
import Image from "next/image";

interface FacebookIconProps {
  className?: string;
}

export function FacebookIcon({ className }: FacebookIconProps) {
  return (
    <Image
      src="/image/facebook.svg"
      alt="Facebook"
      width={16}
      height={16}
      className={cn("h-4 w-4", className)}
    />
  );
}
