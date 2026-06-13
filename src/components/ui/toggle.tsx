"use client";

import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:opacity-50",
        checked ? "bg-primary justify-end" : "bg-border justify-start"
      )}
    >
      <span className="h-5 w-5 rounded-full bg-white transition-transform" />
    </button>
  );
}
