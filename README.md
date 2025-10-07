# TradeCast V1

TradeCast turns onchain trades into Farcaster-native content. The project demonstrates how a Base builder can compose data from
open APIs, bundle it inside a cast-ready UI, and ship mirror buttons that let anyone copy the move in seconds.

## Features

- **Live Trade Feed** – Query DexScreener and GeckoTerminal to surface real Base trades with tx hashes, trader addresses, and
  price snapshots.
- **Mirror Buttons** – Auto-generate swap links (Uniswap, Aerodrome, custom) so followers can mirror the trade instantly.
- **Cast Composer** – Draft TradeCast payloads with proof links and wallet metadata ready for Warpcast, Frames, or Monad mini
  apps.
- **Future Roadmap** – Highlights how to extend the concept with follow systems, leaderboards, and onchain receipts.

## Running locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Fetching live trade data requires outbound network access because it hits open APIs
( DexScreener and GeckoTerminal ).

## API

`GET /api/tradecasts?token=<query>`

Returns TradeCast objects that include trade metadata, BaseScan proof links, mirror URLs, and optional chart points.

## Deployment

The project is optimized for Vercel (zero-config). Environment variables are not required by default, but you can optionally
proxy API calls through your own edge function if rate limits are encountered.
