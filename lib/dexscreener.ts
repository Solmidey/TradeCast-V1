import { TradeCast, TradeCastChartPoint, TradeCastPairMeta, TradeCastTrade } from "./types";
import { buildTradeReceiptUrl } from "./notary";

interface DexScreenerPair {
  chainId: string;
  pairAddress: string;
  dexId: string;
  url: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
}

interface DexScreenerTrade {
  txId?: string;
  txHash?: string;
  priceUsd: string | number;
  amountUsd: string | number;
  amountToken?: string | number;
  amountNative?: string | number;
  timestamp: number;
  side: "buy" | "sell";
  maker: string;
}

const DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex";
const GECKOTERMINAL_BASE_URL = "https://api.geckoterminal.com/api/v2";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "TradeCast/1.0 (+https://base.org)",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 15 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function searchPairsByToken(query: string) {
  const data = await fetchJson<{ pairs: DexScreenerPair[] }>(
    `${DEXSCREENER_BASE_URL}/search?q=${encodeURIComponent(query)}`,
  );

  return data.pairs ?? [];
}

export async function fetchRecentTrades(pair: DexScreenerPair, limit = 5) {
  const { chainId, pairAddress } = pair;
  const data = await fetchJson<{ trades: DexScreenerTrade[] }>(
    `${DEXSCREENER_BASE_URL}/trades/${chainId}/${pairAddress}?limit=${limit}`,
  );

  return (data.trades ?? []).map((trade) => ({
    ...trade,
    priceUsd: Number(trade.priceUsd ?? 0),
    amountUsd: Number(trade.amountUsd ?? 0),
    amountToken: Number(trade.amountToken ?? trade.amountNative ?? 0),
  }));
}

export async function fetchChartPoints(pair: DexScreenerPair, range = 12) {
  try {
    const { chainId, pairAddress } = pair;
    const data = await fetchJson<{ data: { attributes: { ohlcv_list: [number, string][] } } }>(
      `${GECKOTERMINAL_BASE_URL}/networks/${chainId}/pools/${pairAddress}/ohlcv/hour?aggregate=1&limit=${range}`,
    );

    const ohlcv = data?.data?.attributes?.ohlcv_list ?? [];

    const points: TradeCastChartPoint[] = ohlcv.map(([time, price]) => ({
      time: time * 1000,
      priceUsd: Number(price),
    }));

    return points;
  } catch (error) {
    console.error("chart fetch failed", error);
    return [];
  }
}

export function buildMirrorUrl(pair: DexScreenerPair) {
  if (pair.chainId === "base") {
    return `https://app.uniswap.org/swap?chain=base&outputCurrency=${pair.baseToken.address}`;
  }
  return pair.url;
}

export function toTradeCast(
  pair: DexScreenerPair,
  trade: DexScreenerTrade,
  chart?: TradeCastChartPoint[],
): TradeCast {
  const txHash = trade.txId ?? trade.txHash ?? "";

  const meta: TradeCastPairMeta = {
    tokenSymbol: pair.baseToken.symbol,
    tokenName: pair.baseToken.name,
    tokenAddress: pair.baseToken.address,
    network: pair.chainId,
    pairAddress: pair.pairAddress,
    dexUrl: pair.url,
  };

  const tradeMeta: TradeCastTrade = {
    direction: trade.side,
    amountToken: Number(trade.amountToken ?? 0),
    amountUsd: Number(trade.amountUsd ?? 0),
    priceUsd: Number(trade.priceUsd ?? 0),
    timestamp: trade.timestamp * 1000,
    txHash,
    trader: trade.maker,
  };

  const receiptUrl = buildTradeReceiptUrl(txHash);
  const transactionUrl = txHash ? `https://basescan.org/tx/${txHash}` : undefined;
  const proofUrl = receiptUrl ?? transactionUrl ?? pair.url;

  return {
    id: `${pair.pairAddress}-${txHash}`,
    pair: meta,
    trade: tradeMeta,
    proofUrl,
    receiptUrl,
    transactionUrl,
    mirrorUrl: buildMirrorUrl(pair),
    chart,
  };
}
