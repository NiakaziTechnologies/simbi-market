// @ts-nocheck
export function formatUSD(value: number | null | undefined) {
  // Handle NaN, null, undefined, and other invalid values
  const numValue = typeof value === "number" && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numValue);
}
