# TradeCast V1

TradeCast turns on-chain trades into Farcaster-native content. The project demonstrates how a Base builder can compose data from open APIs, bundle it inside a cast-ready UI, and ship mirror buttons that let anyone copy the move in seconds.

It also includes an optional lightweight Python module that adds **multi-chain support** for interacting with EVM-compatible chains via JSON-RPC.

---

## Features

- **Live Trade Feed** – Query DexScreener and GeckoTerminal to surface real Base trades with tx hashes, trader addresses, and price snapshots.
- **Mirror Buttons** – Auto-generate swap links (Uniswap, Aerodrome, custom) so followers can mirror the trade instantly.
- **Cast Composer** – Draft TradeCast payloads with proof links and wallet metadata ready for Warpcast, Frames, or Monad mini apps.
- **Future Roadmap** – Extend with follow systems, leaderboards, and on-chain receipts.

---

## Multi-chain support (Python module)

A lightweight Python module lets TradeCast interact with multiple EVM-compatible chains through JSON-RPC calls. Chains are configured through JSON files and loaded into a registry that the `TradeCast` class uses to broadcast transactions or execute queries on multiple networks at once.

### Getting started (Python)

1. Create a virtual environment and install dependencies (no external deps required for the base module; you can install `pytest` to run unit tests).
2. Populate `chains/default_chains.json` with the RPC URLs that you want to use.
3. Use the module in your scripts:

```python
from pathlib import Path
from tradecast import TradeCast, load_chains_from_file

registry = load_chains_from_file(Path("chains/default_chains.json"))
client = TradeCast(registry)

# Fetch the latest block numbers across all chains
block_numbers = client.fetch_latest_block_numbers()
print(block_numbers)

# Broadcast a signed raw transaction to a subset of chains
raw_tx = "0x..."
response = client.broadcast_raw_transaction(raw_tx, chains=["Ethereum", "Polygon"])
print(response)

