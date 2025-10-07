import { keccak256, stringToHex } from "viem";

const NOTARY_EVENT_SIGNATURE = "TradeNotarized(address,bytes32,bytes32,string,uint256)";
const TRADE_NOTARIZED_TOPIC = keccak256(stringToHex(NOTARY_EVENT_SIGNATURE));

const FALLBACK_RECEIPT_ADDRESS = "0xaf94ad1a7c0c9f3f988217c46dca5ea4665f57c0";

function normalizeAddress(value: string | undefined | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("0x") ? trimmed.toLowerCase() : `0x${trimmed.toLowerCase()}`;
}

const rawReceiptAddress = process.env.NEXT_PUBLIC_TRADE_RECEIPT_ADDRESS;
const RECEIPT_ADDRESS =
  rawReceiptAddress?.trim().toLowerCase() === "disabled"
    ? undefined
    : normalizeAddress(rawReceiptAddress) ?? FALLBACK_RECEIPT_ADDRESS;
const BASESCAN_ADDRESS = "https://basescan.org";

function normalizeTxHash(hash: string | undefined | null) {
  if (!hash) return undefined;
  const trimmed = hash.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("0x") ? trimmed.toLowerCase() : `0x${trimmed.toLowerCase()}`;
}

export function getReceiptContractAddress() {
  return RECEIPT_ADDRESS;
}

export function getTradeNotarizedTopic() {
  return TRADE_NOTARIZED_TOPIC;
}

export function buildTradeReceiptUrl(txHash: string | undefined | null) {
  if (!RECEIPT_ADDRESS) return undefined;
  const normalizedHash = normalizeTxHash(txHash);
  if (!normalizedHash) return undefined;

  const address = RECEIPT_ADDRESS;
  const topic0 = TRADE_NOTARIZED_TOPIC;
  const topic1 = normalizedHash;

  return `${BASESCAN_ADDRESS}/address/${address}#eventlog#address=${address}&topic0=${topic0}&topic1=${topic1}`;
}
