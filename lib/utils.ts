import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const data = (err as { response?: { data?: { error?: string; errors?: string[]; detail?: string } } })
    ?.response?.data;
  if (data?.errors?.length) return data.errors.join(" ");
  if (data?.error) {
    if (data.detail && process.env.NODE_ENV === "development") {
      return `${data.error} (${data.detail})`;
    }
    return data.error;
  }
  return fallback;
}
