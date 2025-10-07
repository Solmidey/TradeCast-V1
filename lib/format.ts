import { formatDistanceToNowStrict } from "date-fns";

export function formatUsd(value: number) {
  if (!Number.isFinite(value)) return "$0.00";
  if (Math.abs(value) >= 1000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatTokenAmount(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatRelativeTime(timestamp: number) {
  if (!timestamp) return 'just now';
  return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return "unknown";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function shortenHash(hash: string) {
  return shortenAddress(hash, 6);
}
