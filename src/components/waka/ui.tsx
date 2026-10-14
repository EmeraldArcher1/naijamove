import { cn } from "@/lib/cn";
import { naira } from "@/lib/waka/model";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{naira(value)}</span>;
}

export function Button({
  variant = "primary",
  full = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  full?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "press inline-flex h-12 items-center justify-center gap-2 rounded-md px-4 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-steel disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" && "bg-taxi text-fg shadow-sm hover:bg-taxi-deep",
        variant === "secondary" && "border border-line bg-surface text-fg",
        variant === "ghost" && "bg-transparent text-fg",
        variant === "danger" && "border border-line bg-surface text-bad",
        full && "w-full",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-line bg-surface p-4", className)}>{children}</section>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-muted">{children}</p>;
}

export function Delta({ value, unit }: { value: number; unit?: string }) {
  const positive = value > 0;
  const negative = value < 0;
  return (
    <span className={cn("tabular-nums", positive && "text-good", negative && "text-bad", !positive && !negative && "text-muted")}>
      {positive ? "Under by " : negative ? "Above by " : "Same as usual "}
      {naira(Math.abs(value))}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}
