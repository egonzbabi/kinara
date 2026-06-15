import { Link } from "react-router";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "~/lib/cn";

type Variant = "clay" | "ink" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  clay: "btn-clay",
  ink: "btn-ink",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2.5 text-[13px]",
  md: "",
  lg: "px-7 py-4 text-[15px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
};

function classes({ variant = "clay", size = "md", full, className }: CommonProps) {
  return cn("btn", VARIANT[variant], SIZE[size], full && "w-full", className);
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button">;
export function Button({
  variant,
  size,
  full,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={classes({ variant, size, full, className, children })}
      {...rest}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = CommonProps & { to: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "to" | "className"
  >;
export function LinkButton({
  variant,
  size,
  full,
  className,
  children,
  to,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={classes({ variant, size, full, className, children })}
      {...rest}
    >
      {children}
    </Link>
  );
}
