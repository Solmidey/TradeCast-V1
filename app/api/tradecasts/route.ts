import { NextResponse } from "next/server";
import { fetchChartPoints, fetchRecentTrades, searchPairsByToken, toTradeCast } from "@/lib/dexscreener";
import type { TradeCast } from "@/lib/types";

export const revalidate = 15;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const limit = Number(searchParams.get("limit") ?? "8");

  if (!token) {
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }

  try {
    const pairs = await searchPairsByToken(token.toLowerCase());
    const selectedPairs = pairs.slice(0, Math.max(1, Math.min(limit, 4)));

    const casts: TradeCast[] = [];

    for (const pair of selectedPairs) {
      const [trades, chart] = await Promise.all([
        fetchRecentTrades(pair, 4),
        fetchChartPoints(pair, 16),
      ]);

      trades.forEach((trade) => {
        casts.push(toTradeCast(pair, trade, chart));
      });
    }

    return NextResponse.json({ casts });
  } catch (error) {
    console.error("failed to load tradecasts", error);
    return NextResponse.json({ error: "Failed to load tradecasts" }, { status: 500 });
  }
}
