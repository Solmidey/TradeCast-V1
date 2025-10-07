export type TradeDirection = "buy" | "sell";

export interface TradeCastTrade {
  direction: TradeDirection;
  amountToken: number;
  amountUsd: number;
  priceUsd: number;
  timestamp: number;
  txHash: string;
  trader: string;
}

export interface TradeCastPairMeta {
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  network: string;
  pairAddress: string;
  dexUrl?: string;
}

export interface TradeCastChartPoint {
  time: number;
  priceUsd: number;
}

export interface TradeCast {
  id: string;
  pair: TradeCastPairMeta;
  trade: TradeCastTrade;
  proofUrl: string;
  mirrorUrl?: string;
  chart?: TradeCastChartPoint[];
}

export interface TradeMirrorPreset {
  name: string;
  description: string;
  url: string;
}
