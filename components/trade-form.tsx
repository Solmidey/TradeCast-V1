"use client";

import { useMemo, useState } from "react";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import { cn } from "./ui/utils";
import { TradeMirrorPreset } from "@/lib/types";

const mirrorPresets: TradeMirrorPreset[] = [
  {
    name: "Uniswap",
    description: "Open a swap on Base with your inputs prefilled.",
    url: "https://app.uniswap.org/swap?chain=base",
  },
  {
    name: "Aerodrome",
    description: "Send people straight to Aerodrome's Base pools.",
    url: "https://aerodrome.finance/swap",
  },
  {
    name: "Beam Mirror",
    description: "Trigger a Farcaster frame that mirrors the trade.",
    url: "https://warpcast.com/~/compose?text=Mirroring%20this%20trade",
  },
];

export function TradeComposer() {
  const [tokenSymbol, setTokenSymbol] = useState("DEGEN");
  const [network, setNetwork] = useState("base");
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [amountToken, setAmountToken] = useState(0.2);
  const [amountUsd, setAmountUsd] = useState(120);
  const [txHash, setTxHash] = useState("0x1234...abcd");
  const [wallet, setWallet] = useState("0xF39a...cB00");

  const castCopy = useMemo(() => {
    const action = direction === "buy" ? "Bought" : "Sold";
    return `${action} ${formatTokenAmount(amountToken)} ${tokenSymbol} on ${network} (${formatUsd(amountUsd)}) #TradeCast`;
  }, [direction, amountToken, tokenSymbol, network, amountUsd]);

  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40">
        <h2 className="text-xl font-semibold">Compose a TradeCast</h2>
        <p className="mt-2 text-sm text-white/70">
          Pull in your latest Base move or draft a hypothetical trade. When you post, the cast bundles proof links and a
          mirror button other users can slam.
        </p>

        <form className="mt-6 space-y-4 text-sm">
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-wide text-white/40">Token</label>
            <input
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              value={tokenSymbol}
              onChange={(event) => setTokenSymbol(event.target.value.toUpperCase())}
              placeholder="DEGEN"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <label className="text-xs uppercase tracking-wide text-white/40">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {(["buy", "sell"] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setDirection(option)}
                    className={cn(
                      "rounded-2xl border border-white/10 px-3 py-2 transition",
                      direction === option ? "bg-primary text-primary-foreground" : "bg-black/30 text-white/70 hover:border-white/30",
                    )}
                  >
                    {option === "buy" ? "Buy" : "Sell"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3">
              <label className="text-xs uppercase tracking-wide text-white/40">Network</label>
              <select
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                value={network}
                onChange={(event) => setNetwork(event.target.value)}
              >
                <option value="base">Base</option>
                <option value="optimism">Optimism</option>
                <option value="zora">Zora</option>
                <option value="mainnet">Mainnet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <label className="text-xs uppercase tracking-wide text-white/40">Amount (token)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                value={amountToken}
                onChange={(event) => setAmountToken(Number(event.target.value))}
              />
            </div>
            <div className="grid gap-3">
              <label className="text-xs uppercase tracking-wide text-white/40">Amount (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                value={amountUsd}
                onChange={(event) => setAmountUsd(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-wide text-white/40">Transaction hash</label>
            <input
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              value={txHash}
              onChange={(event) => setTxHash(event.target.value)}
              placeholder="0xabc..."
            />
          </div>

          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-wide text-white/40">Wallet</label>
            <input
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              value={wallet}
              onChange={(event) => setWallet(event.target.value)}
              placeholder="0x123..."
            />
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 text-sm text-white/80">
        <h3 className="text-lg font-semibold text-primary-foreground">Cast preview</h3>
        <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-primary/30 bg-black/30 px-4 py-3 text-sm font-mono text-primary-foreground">
          {castCopy}

Proof: https://basescan.org/tx/{txHash}
Wallet: {wallet}
        </p>
        <p className="mt-3 text-xs text-primary-foreground/70">
          Drop this text into Warpcast or plug it into a Frame composer. TradeCast Mini Apps can also ingest this payload over
          Farcaster JSON.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <h3 className="text-lg font-semibold">Mirror buttons</h3>
        <p className="mt-2 text-sm text-white/70">
          Attach a CTA that lets your followers jump into the same trade. These URLs power the button inside Warpcast Frames
          or Monad mini apps.
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          {mirrorPresets.map((preset) => (
            <li key={preset.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{preset.name}</p>
                  <p className="text-xs text-white/60">{preset.description}</p>
                </div>
                <a
                  className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                  href={preset.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Copy URL
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
