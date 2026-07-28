import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const data = (err as { response?: { data?: { error?: string; errors?: string[] } } })?.response?.data;
  if (data?.errors?.length) return data.errors.join(" ");
  if (data?.error) return data.error;
  return fallback;
}
