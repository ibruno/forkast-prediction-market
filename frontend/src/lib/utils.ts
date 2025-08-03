import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRules(rules: string): string {
  if (!rules)
    return ''

  return rules
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/^"/, '') // Remove quotes at the beginning
    .replace(/"$/, '') // Remove quotes at the end
}

export function formatOracleAddress(address: string): string {
  if (!address || !address.startsWith('0x'))
    return '0x0000...0000'

  const prefix = address.substring(0, 6)
  const suffix = address.substring(address.length - 4)
  return `${prefix}...${suffix}`
}

export function sanitizeSvg(svg: string) {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
}
