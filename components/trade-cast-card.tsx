"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TradeCast } from "@/lib/types";
import { formatRelativeTime, formatTokenAmount, formatUsd, shortenAddress, shortenHash } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

interface TradeCastCardProps {
  cast: TradeCast;
}

export function TradeCastCard({ cast }: TradeCastCardProps) {
  const { pair, trade, proofUrl, mirrorUrl, chart } = cast;

  const chartData = useMemo(
    () =>
      chart?.map((point) => ({
        time: new Date(point.time).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: point.priceUsd,
      })) ?? [],
    [chart],
  );

  return (
    <Card className="gradient-border">
      <div className="gradient-content">
        <CardHeader className="space-y-3 border-b border-white/5 bg-white/5 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-white">
              {trade.direction === "buy" ? "Bought" : "Sold"} {formatTokenAmount(trade.amountToken)} {pair.tokenSymbol}
            </CardTitle>
            <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
              {pair.network}
            </span>
          </div>
          <p className="text-sm text-white/70">
            {formatUsd(trade.amountUsd)} @ {formatUsd(trade.priceUsd)} • {formatRelativeTime(trade.timestamp)} by {shortenAddress(trade.trader)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-5">
          {chartData.length > 0 ? (
            <div className="h-40 w-full overflow-hidden rounded-xl border border-white/5 bg-black/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
                  <defs>
                    <linearGradient id={`priceGradient-${cast.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5D6BFF" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#5D6BFF" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} interval="preserveEnd" />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    cursor={{ stroke: "#5D6BFF", strokeDasharray: "4 4" }}
                    contentStyle={{
                      background: "#0b0e1a",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                    formatter={(value) => [formatUsd(Number(value)), "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#5D6BFF" strokeWidth={2} fillOpacity={1} fill={`url(#priceGradient-${cast.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-white/60">
              Waiting for price snapshot… charts load once GeckoTerminal provides OHLCV data.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-primary/70 hover:bg-primary/20"
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
            >
              Onchain proof {shortenHash(trade.txHash)}
            </a>
            {mirrorUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground transition hover:shadow-glow"
                href={mirrorUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mirror trade
              </a>
            ) : null}
            {pair.dexUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 transition hover:border-white/40"
                href={pair.dexUrl}
                target="_blank"
                rel="noreferrer"
              >
                View pair
              </a>
            ) : null}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
