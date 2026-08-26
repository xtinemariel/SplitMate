import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-[#455C4D]",
        variant === "secondary" &&
          "border border-border bg-[#F3EEE6] text-secondary-foreground hover:bg-[#E9E1D5]",
        variant === "ghost" &&
          "text-foreground hover:bg-muted hover:text-foreground",
        variant === "destructive" &&
          "bg-[#F3E5DF] text-[#8F5748] hover:bg-[#EBD6CD]",
        className,
      )}
      {...props}
    />
  );
}
