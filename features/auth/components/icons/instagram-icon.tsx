import { cn } from "@/core/lib/utils";
import Image from "next/image";

interface InstagramIconProps {
  className?: string;
}

export function InstagramIcon({ className }: InstagramIconProps) {
  return (
    <Image
      src="/image/instagram.svg"
      alt="Instagram"
      width={16}
      height={16}
      className={cn("h-4 w-4", className)}
    />
  );
}
