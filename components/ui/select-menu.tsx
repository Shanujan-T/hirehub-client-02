"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectMenuOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type SelectMenuProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectMenuOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function SelectMenu({
  id: idProp,
  value = "",
  onChange,
  onBlur,
  options,
  placeholder = "Select…",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectMenuProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;

  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = useCallback(() => {
    setOpen(false);
    setHighlightIndex(-1);
    onBlur?.();
  }, [onBlur]);

  const selectOption = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      close();
      triggerRef.current?.focus();
    },
    [close, onChange, options]
  );

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) setOpen(true);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      default:
        break;
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setHighlightIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightIndex >= 0) selectOption(highlightIndex);
        break;
      case "Escape":
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 text-left text-sm outline-none transition",
          "focus:border-info focus:ring-2 focus:ring-info/20",
          open && "border-info ring-2 ring-info/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              {selected.icon}
            </span>
          )}
          <span className={cn("truncate", !selected && "text-muted")}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <ul
        id={listboxId}
        role="listbox"
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={handleListKeyDown}
        className={cn(
          "absolute z-50 mt-1.5 max-h-60 w-full origin-top overflow-auto rounded-xl border border-border bg-card p-1 shadow-lg",
          "transition-all duration-150 ease-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
        )}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isHighlighted = index === highlightIndex;
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setHighlightIndex(index)}
              onClick={() => selectOption(index)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-colors",
                isHighlighted && "bg-brand-gradient/10 ring-1 ring-inset ring-secondary/30",
                isSelected && !isHighlighted && "bg-secondary/5",
                !isHighlighted && !isSelected && "hover:bg-secondary/10"
              )}
            >
              {option.icon && (
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isHighlighted || isSelected
                      ? "bg-brand-gradient text-white shadow-sm"
                      : "bg-secondary/10 text-secondary"
                  )}
                >
                  {option.icon}
                </span>
              )}
              <span className={cn("font-medium", isSelected && "text-brand-gradient")}>{option.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
