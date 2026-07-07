import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-zinc-900 text-white hover:bg-zinc-800",
        variant === "secondary" &&
          "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
        variant === "ghost" && "text-zinc-600 hover:bg-zinc-100",
        className,
      )}
      {...props}
    />
  );
}
