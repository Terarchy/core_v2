/**
 * Formats a date into a readable string format
 * @param date - Date to format
 * @returns Formatted date string in local format
 */
export function formatDate(date: Date): string {
  if (!(date instanceof Date) && typeof date === 'string') {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date instanceof Date ? date : new Date(date))
}

/**
 * Formats a datetime into a readable string format with time
 * @param date - Date to format
 * @returns Formatted datetime string in local format with time
 */
export function formatDateTime(date: Date): string {
  if (!(date instanceof Date) && typeof date === 'string') {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date instanceof Date ? date : new Date(date))
}

/**
 * Formats a currency value with the appropriate symbol
 * @param amount - Amount to format
 * @param currency - Currency code (USD, EUR, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
