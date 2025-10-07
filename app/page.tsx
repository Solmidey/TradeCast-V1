import { TradeFeed } from "@/components/trade-feed";
import { TradeComposer } from "@/components/trade-form";
import { Sparkles, Zap, Share2, Activity } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Cast from any Base wallet",
    body: "Point TradeCast at a wallet or token and auto-generate a Farcaster-ready post with receipts.",
  },
  {
    icon: Share2,
    title: "Mirror-ready buttons",
    body: "Attach Uniswap, Aerodrome, or custom links so friends can copy the move instantly.",
  },
  {
    icon: Activity,
    title: "Onchain proof baked in",
    body: "Every cast bundles the tx hash, BaseScan link, and price snapshot so followers trust the trade.",
  },
  {
    icon: Zap,
    title: "Mini app & Frame compatible",
    body: "Drop TradeCast inside Warpcast Frames or Monad mini apps without touching heavy infra.",
  },
];

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-12">
      <section className="space-y-8">
        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-primary/20 via-surface/80 to-black/80 p-10 shadow-2xl shadow-primary/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground">
                Base builder drop
              </span>
              <h1 className="text-4xl font-semibold sm:text-5xl">TradeCast: turn your onchain flex into social fire</h1>
              <p className="text-lg text-white/80">
                TradeCast is a Farcaster-native feed that converts Base trades into shareable casts. Pull live swaps, mirror
                the move in one tap, and stack Base Builder XP without shipping heavy contracts.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground shadow-lg shadow-primary/50 transition hover:shadow-glow"
                  href="https://warpcast.com/~/compose?text=Posting%20my%20first%20TradeCast%20from%20Base"
                  target="_blank"
                  rel="noreferrer"
                >
                  Launch on Warpcast
                </a>
                <a
                  className="rounded-full border border-white/20 px-6 py-2 font-semibold text-white/80 transition hover:border-white/50"
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  Builder docs
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70 lg:max-w-sm">
              <h2 className="text-lg font-semibold text-white">How it works</h2>
              <ol className="mt-4 space-y-3">
                <li>
                  <strong className="text-white">1. Fetch</strong> — Point at Base trades with open APIs like DexScreener or GeckoTerminal.
                </li>
                <li>
                  <strong className="text-white">2. Cast</strong> — Wrap the trade in Farcaster-ready metadata: proof, chart, wallet.
                </li>
                <li>
                  <strong className="text-white">3. Mirror</strong> — Offer quick mirror links so followers can execute in one tap.
                </li>
              </ol>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/40">
                Deploys free on Vercel • Optional contract to notarize trades • Wallet connect ready via Wagmi
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((highlight) => (
            <article key={highlight.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              <highlight.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="text-base font-semibold text-white">{highlight.title}</h3>
              <p className="mt-2 text-sm text-white/70">{highlight.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TradeFeed />
        <TradeComposer />
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/40 p-10">
        <h2 className="text-2xl font-semibold">Where TradeCast can go next</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h3 className="text-lg font-semibold text-white">Mirrors & follows</h3>
            <p className="mt-2 text-sm">
              Ship a follow contract that auto-executes swaps whenever a wallet you subscribe to casts. Add allowlists or spend
              caps so users can mirror without fear.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h3 className="text-lg font-semibold text-white">Leaderboards</h3>
            <p className="mt-2 text-sm">
              Score traders on realized PnL or win-rate, then plug rankings into Warpcast channels. Reward top wallets with Base
              Builder XP or sponsor drops.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h3 className="text-lg font-semibold text-white">Smart contract receipts</h3>
            <p className="mt-2 text-sm">
              Deploy a lightweight Base contract that notarizes trade payloads. Casts link to the contract log so the social
              proof survives even if an API disappears.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
