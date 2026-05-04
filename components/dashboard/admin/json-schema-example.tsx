"use client"

import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const PRE_BOX =
  "min-h-[11rem] max-h-[min(48vh,20rem)] flex-1 overflow-auto rounded-lg border border-border/90 bg-muted/50 p-3 text-[11px] leading-relaxed text-foreground shadow-inner dark:border-zinc-600/90 dark:bg-zinc-950/80 dark:text-zinc-100 font-mono whitespace-pre-wrap sm:text-xs"

const COL_CAPTION =
  "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-zinc-400"

/**
 * Swagger-style sample block (stacked layout). Prefer {@link JsonSchemaJsonField} next to a textarea.
 */
export function JsonSchemaExample({
  example,
  description,
  className,
  showHint = true,
}: {
  example: string
  description?: string
  className?: string
  /** When false, hides the footnote under the sample. */
  showHint?: boolean
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {description ? (
        <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed">{description}</p>
      ) : null}
      <pre className={cn(PRE_BOX, "max-h-44")} tabIndex={0}>
        {example.trim()}
      </pre>
      {showHint ? (
        <p className="text-xs text-muted-foreground/95 dark:text-zinc-400 leading-snug">
          Replace placeholders with your real values; the field below must be valid JSON.
        </p>
      ) : null}
    </div>
  )
}

const DEFAULT_SPLIT_HINT =
  "Edit the JSON on the right. Keep the same property names as the example where your integration expects them."

type JsonSchemaJsonFieldProps = {
  /** Omit when the caller renders a custom heading (e.g. label + action button row). */
  label?: ReactNode
  labelClassName?: string
  description?: string
  example: string
  /** Shown under both columns. Pass false to hide. */
  hint?: string | false
  children: ReactNode
  className?: string
}

/**
 * Optional label + description, then example JSON and input side by side (stacks on small screens).
 */
export function JsonSchemaJsonField({
  label,
  labelClassName,
  description,
  example,
  hint = DEFAULT_SPLIT_HINT,
  children,
  className,
}: JsonSchemaJsonFieldProps) {
  return (
    <div className={cn("grid gap-2.5", className)}>
      {label != null || description ? (
        <div className="space-y-1">
          {label != null ? (
            <Label className={cn("text-sm font-semibold text-foreground dark:text-zinc-100", labelClassName)}>
              {label}
            </Label>
          ) : null}
          {description ? (
            <p className="text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 md:items-stretch">
        <div className="flex min-h-0 flex-col gap-1.5">
          <span className={COL_CAPTION}>Example</span>
          <pre className={PRE_BOX} tabIndex={0}>
            {example.trim()}
          </pre>
        </div>
        <div className="flex min-h-0 flex-col gap-1.5 min-w-0">
          <span className={COL_CAPTION}>Your JSON</span>
          <div
            className={cn(
              "flex flex-1 flex-col min-h-[11rem] min-w-0",
              "[&_textarea]:min-h-[11rem] [&_textarea]:max-h-[min(48vh,20rem)] [&_textarea]:w-full [&_textarea]:resize-y",
              "[&_textarea]:font-mono [&_textarea]:text-xs [&_textarea]:leading-relaxed",
              "[&_textarea]:border-zinc-600/60 dark:[&_textarea]:border-zinc-600 [&_textarea]:bg-background dark:[&_textarea]:bg-zinc-950/50",
              "[&_textarea]:text-foreground dark:[&_textarea]:text-zinc-100"
            )}
          >
            {children}
          </div>
        </div>
      </div>

      {hint !== false ? (
        <p className="text-xs text-muted-foreground dark:text-zinc-400 leading-relaxed border-t border-border/60 dark:border-zinc-700/80 pt-2.5">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
