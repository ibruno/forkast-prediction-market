import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Função para tratar caracteres de escape em rules do JSON
 * Converte \n em quebras de linha e \" em aspas normais
 */
export function formatRules(rules: string): string {
  if (!rules)
    return ''

  return rules
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/^"/, '') // Remove quotes at the beginning
    .replace(/"$/, '') // Remove quotes at the end
}

/**
 * Função para formatar endereço do oracle (abreviado)
 * Converte 0x1234567890abcdef... em 0x1234...abcdef
 */
export function formatOracleAddress(address: string): string {
  if (!address || !address.startsWith('0x'))
    return '0x0000...0000'

  const prefix = address.substring(0, 6)
  const suffix = address.substring(address.length - 4)
  return `${prefix}...${suffix}`
}
