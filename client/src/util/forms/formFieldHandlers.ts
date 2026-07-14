import type { ChangeEvent, Dispatch, FocusEvent, SetStateAction } from "react";

export function createFieldHandlers<
  Errors extends Record<keyof Errors, string | null>,
>(setErrors: Dispatch<SetStateAction<Errors>>) {
  return function fieldHandlers<K extends keyof Errors>(
    key: K,
    setValue: (value: string) => void,
    validate: (value: string) => string | null,
  ) {
    return {
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        // only re-validate once the field is already in an error state
        setErrors((prev) =>
          prev[key] ? { ...prev, [key]: validate(event.target.value) } : prev,
        );
      },
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        setErrors((prev) => ({ ...prev, [key]: validate(event.target.value) }));
      },
    };
  };
}

export const labelClasses = "mb-2 block text-sm font-bold text-fg";

export function inputClasses(hasError: boolean): string {
  const borderClasses = hasError
    ? "border-error focus:border-error"
    : "border-line-strong focus:border-fill";

  return `w-full rounded-lg border px-4 py-3 text-fg placeholder:text-fg-faint focus:outline-none ${borderClasses}`;
}
