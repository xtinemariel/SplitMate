import { cn } from "@/lib/utils";

export const surfaceVariants = {
  lavender: "bg-[#F4F1FF] shadow-[0_16px_40px_rgba(121,96,186,0.12)]",
  mint: "bg-[#ECFDF5] shadow-[0_16px_40px_rgba(87,156,132,0.12)]",
  peach: "bg-[#FFF1E8] shadow-[0_16px_40px_rgba(195,129,99,0.12)]",
  blue: "bg-[#EEF6FF] shadow-[0_16px_40px_rgba(95,143,196,0.12)]",
  yellow: "bg-[#FFF8DB] shadow-[0_16px_40px_rgba(194,164,70,0.12)]",
  neutral: "bg-[#FFFDF8] shadow-[0_12px_28px_rgba(106,109,130,0.08)]",
} as const;

export type SurfaceVariant = keyof typeof surfaceVariants;

export function surfaceCardClass(
  variant: SurfaceVariant,
  className?: string,
) {
  return cn("rounded-[24px]", surfaceVariants[variant], className);
}

/** Soft row separators for list cards — between items only, never after the last. */
export const surfaceListDivideClass =
  "divide-y divide-[rgba(106,109,130,0.12)]";
