/** Formats a stringified nanoton amount (wire convention: bigint-as-string)
 *  as TON for display — never computed for business logic, the server owns
 *  the totals. Values >= 0.01 round to 2 decimals (the common case: balances
 *  and payouts read as e.g. "1.34"). Smaller-than-a-cent values would round
 *  to a misleading "0.00" at 2 decimals, so those instead show up to 6
 *  decimals with trailing zeros trimmed (e.g. "0.000384") — real precision
 *  instead of hiding a genuinely nonzero amount. */
export function formatTon(nanoTonString: string): string {
  const value = Number(nanoTonString) / 1_000_000_000;
  if (!Number.isFinite(value) || value === 0) {
    return "0.00";
  }
  if (Math.abs(value) >= 0.01) {
    return value.toFixed(2);
  }
  return value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}
