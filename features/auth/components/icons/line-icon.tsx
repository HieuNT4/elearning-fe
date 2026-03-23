import { cn } from "@/core/lib/utils";
import Image from "next/image";

interface LineIconProps {
  className?: string;
}

export function LineIcon({ className }: LineIconProps) {
  return (
    <Image
      src="/image/line.svg"
      alt="LINE"
      width={16}
      height={16}
      className={cn("h-4 w-4", className)}
    />
  );
}
