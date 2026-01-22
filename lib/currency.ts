// @ts-nocheck
export function formatUSD(value: number | null | undefined) {
  // Handle NaN, null, undefined, and other invalid values
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  // Ensure it's a number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return '$0.00';
  }

  // Format as USD currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}