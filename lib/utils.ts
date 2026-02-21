import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format amount as Rwandan Franc (RWF). Used across the admin dashboard. */
export function formatRWF(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount)
  if (Number.isNaN(num)) return "RWF 0"
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}
