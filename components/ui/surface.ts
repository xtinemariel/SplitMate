import { cn } from "@/lib/utils";

/** Soft warm surface washes — desaturated, notebook-like. */
export const surfaceVariants = {
  sage:
    "border border-[#D5DDD4] bg-[#E8EEE7] shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
  mint:
    "border border-[#D0DBD2] bg-[#DCE4DB] shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
  peach:
    "border border-[#E0D6C9] bg-[#E9E1D5] shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
  blue:
    "border border-[#C9D3CF] bg-[#E3E9E6] shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
  yellow:
    "border border-[#DDD2B0] bg-[#EFE8D4] shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
  neutral:
    "border border-border bg-card shadow-[0_1px_2px_rgba(41,43,40,0.04)]",
} as const;

export type SurfaceVariant = keyof typeof surfaceVariants;

export function surfaceCardClass(
  variant: SurfaceVariant,
  className?: string,
) {
  return cn("rounded-2xl", surfaceVariants[variant], className);
}

/** Soft row separators for list cards — between items only, never after the last. */
export const surfaceListDivideClass = "divide-y divide-[#E0D8CC]";

export const noticeClass = {
  warning:
    "rounded-2xl bg-[#EFE8D4] px-3 py-2 text-sm text-[#6B6140]",
  success:
    "rounded-2xl bg-[#DCE4DB] px-3 py-2 text-sm text-[#3F5447]",
  error:
    "rounded-2xl bg-[#F3E5DF] px-3 py-2 text-sm text-[#8F5748]",
} as const;

export const fieldErrorClass = "text-xs text-[#8F5748]";
export const fieldSuccessClass = "text-xs text-[#3F5447]";
export const destructiveTextClass =
  "text-[#C87862] hover:text-[#A86450]";
