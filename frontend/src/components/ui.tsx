"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Shell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-[28px] border border-black/6 bg-white/78 p-6 shadow-[0_18px_60px_rgba(20,22,28,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/78 dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  invert?: boolean;
}) {
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.32em]",
          invert ? "text-white/70" : "text-[var(--color-accent)]"
        )}
      >
        {eyebrow}
      </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-semibold leading-tight sm:text-4xl",
          invert ? "text-white" : "text-slate-950 dark:text-white"
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 sm:text-lg",
            invert ? "text-white/75" : "text-slate-700 dark:text-slate-300"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-slate-950",
      secondary:
        "bg-white text-slate-950 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-300 dark:bg-slate-900 dark:text-white dark:ring-white/12 dark:hover:bg-slate-800",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-300 dark:text-slate-200 dark:hover:bg-white/8",
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950",
      "dark:border-white/12 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[140px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950",
      "dark:border-white/12 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "mb-2 block text-sm font-medium text-slate-800 dark:text-slate-200",
        className
      )}
    >
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{message}</p>;
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--color-surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]",
        className
      )}
    >
      {children}
    </span>
  );
}
