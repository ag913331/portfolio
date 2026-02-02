"use client";

import * as React from "react";

import styles from "./Button.module.css";

type ButtonVariant = "solid" | "ghost" | "link" | "unstyled";
type ButtonSize = "sm" | "md" | "lg";

function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

export type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Defaults to "button" to avoid accidental form submits.
   */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", size = "md", type = "button", ...props },
  ref,
) {
  const isUnstyled = variant === "unstyled";

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        !isUnstyled && styles.button,
        !isUnstyled && styles[size],
        !isUnstyled && styles[variant],
        className,
      )}
      {...props}
    />
  );
});


