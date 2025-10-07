"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TradeCast } from "@/lib/types";
import { TradeCastCard } from "./trade-cast-card";
import { RefreshCcw } from "lucide-react";
import { cn } from "./ui/utils";

interface TradeFeedResponse {
  casts: TradeCast[];
  error?: string;
}

async function fetchTradeCasts(token: string) {
  const response = await fetch(`/api/tradecasts?token=${encodeURIComponent(token)}`);
  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(message.error || "Failed to load tradecasts");
  }
  return (await response.json()) as TradeFeedResponse;
}

const popularTokens = ["degen", "friend", "base", "tosi", "usdc", "eth"];

export function TradeFeed() {
  const [tokenQuery, setTokenQuery] = useState("degen");
  const [searchInput, setSearchInput] = useState("degen");

  const { data, isLoading, isError, refetch, error, isFetching } = useQuery({
    queryKey: ["tradecasts", tokenQuery],
    queryFn: () => fetchTradeCasts(tokenQuery),
    refetchInterval: 20_000,
  });

  const casts = useMemo(() => {
    const list = data?.casts ? [...data.casts] : [];
    return list.sort((a, b) => b.trade.timestamp - a.trade.timestamp);
  }, [data]);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <header className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-xl shadow-black/50">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Live TradeCasts</h2>
            <p className="max-w-xl text-sm text-white/70">
              Pull the freshest onchain trades into a Farcaster-ready mini feed. Type a Base token, pair, or wallet, then
              mirror the moves that matter.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form
              className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-inner"
              onSubmit={(event) => {
                event.preventDefault();
                if (!searchInput.trim()) return;
                setTokenQuery(searchInput.trim());
              }}
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Try degen, friend.tech, or a Base wallet"
                className="flex-1 bg-transparent outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground transition hover:shadow-glow"
              >
                Cast it
              </button>
            </form>
            <button
              onClick={() => refetch()}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/40",
                isFetching && "animate-pulse",
              )}
            >
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {popularTokens.map((token) => (
            <button
              key={token}
              onClick={() => {
                setSearchInput(token);
                setTokenQuery(token);
              }}
              className={cn(
                "rounded-full border border-white/10 px-3 py-1 uppercase tracking-wide transition",
                tokenQuery === token ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/70 hover:border-white/30",
              )}
            >
              #{token}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-60 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-6 text-sm text-red-100">
          {error instanceof Error ? error.message : "Unable to load tradecasts. Try again soon."}
        </div>
      ) : casts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {casts.map((cast) => (
            <TradeCastCard key={cast.id} cast={cast} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          No trades found yet. Try another token, or connect a wallet in the composer to log your own onchain move.
        </div>
      )}
    </section>
  );
}
