import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted outline-none focus:border-primary",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
