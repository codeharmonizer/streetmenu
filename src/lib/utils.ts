import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(price: number, locale = 'ar'): string {
  // Always render digits in Latin (0-9); currency label follows the locale.
  // ar-BH-u-nu-latn → Latin digits + Arabic "د.ب" symbol
  // en-BH            → Latin digits + English "BHD" symbol
  const bcp47 = locale === 'ar' ? 'ar-BH-u-nu-latn' : 'en-BH'
  return new Intl.NumberFormat(bcp47, {
    style:                'currency',
    currency:             'BHD',
    minimumFractionDigits: 3,
  }).format(price)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
