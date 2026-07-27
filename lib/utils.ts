import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
  return msg || fallback;
}
