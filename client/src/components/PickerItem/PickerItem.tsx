import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/util/cn";

type PickerItemProps = ButtonHTMLAttributes<HTMLButtonElement>;

// The shared box used by the office and schedule pickers. It only carries the
// styling common to both (layout, hover/focus affordances, transitions); each
// picker passes its own `className` for shape, borders, and selected state.
// Refs are forwarded so it can slot into Radix's `asChild` (e.g. RadioGroup.Item).
const PickerItem = forwardRef<HTMLButtonElement, PickerItemProps>(
  function PickerItem({ className, type = "button", children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center text-fg transition-colors",
          "hover:border-fill",
          "focus-visible:ring-2 focus-visible:ring-line-faint focus-visible:outline-none",
          "disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export default PickerItem;
