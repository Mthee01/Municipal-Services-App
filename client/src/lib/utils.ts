import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amountInCents: number): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(dateObj)
  } catch {
    return 'Invalid Date'
  }
}

export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters < 1000) {
    return `${distanceInMeters}m`
  } else {
    const km = distanceInMeters / 1000
    return `${km.toFixed(1)}km`
  }
}

export function generateRefNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check for valid South African phone number patterns
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return true
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('27')) {
    return true
  }
  
  return false
}