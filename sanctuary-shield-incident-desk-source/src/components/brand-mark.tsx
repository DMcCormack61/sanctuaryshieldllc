import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 72"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M32 3 L58 14 V38 C58 54 46 64 32 69 C18 64 6 54 6 38 V14 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M32 16 V22 L20 34 H44 L32 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M22 34 V52 H42 V34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <path d="M32 16 V11 M29 14 H35" stroke="currentColor" strokeWidth="2.1" />
      <path d="M26 52 V42 H30 V52 M34 52 V42 H38 V52" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
