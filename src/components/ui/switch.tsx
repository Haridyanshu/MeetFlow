"use client"

import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
}

export function Switch({ checked, onChange, disabled, label, id }: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-brand" : "bg-input",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cn(
          "pointer-events-none inline-block size-3.5 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-[18px]" : "translate-x-px",
        )}
      />
      {label && <span className="ml-2 text-sm">{label}</span>}
    </label>
  )
}
