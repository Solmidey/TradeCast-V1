# TradeCast V1

TradeCast turns on-chain trades into Farcaster-native content. The project demonstrates how a Base builder can compose data from open APIs, bundle it inside a cast-ready UI, and ship mirror buttons that let anyone copy the move in seconds.

It also includes an optional lightweight Python module that adds **multi-chain support** for interacting with EVM-compatible chains via JSON-RPC.

---

## Features

- **Live Trade Feed** – Query DexScreener and GeckoTerminal to surface real Base trades with tx hashes, trader addresses, and price snapshots.
- **Mirror Buttons** – Auto-generate swap links (Uniswap, Aerodrome, custom) so followers can mirror the trade instantly.
- **Cast Composer** – Draft TradeCast payloads with proof links and wallet metadata ready for Warpcast, Frames, or Monad mini apps.
- **Onchain Receipts** – A lightweight Base contract notarises TradeCast payloads so casts can cite an immutable log even if external APIs disappear.
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
```

---

## Deployment

TradeCast ships with a production-ready Dockerfile so you can build and run the
Next.js application anywhere that supports containers.

### Build the image

```bash
docker build -t tradecast-app .
```

### Run the container

```bash
docker run --env-file .env.local -p 3000:3000 tradecast-app
```

The application will be available at `http://localhost:3000`. Provide any
required runtime secrets (such as API keys) through an `.env.local` file or
environment variables that you mount into the container.

---

## Onchain trade receipts

TradeCast ships with a Solidity contract that emits notarised receipts for TradeCast payloads.
The contract lives in `contracts/TradeReceipt.sol` and exposes a single `notarize` method that
records the trade payload and a pointer to the original trade transaction via an indexed event.

### Deploying the contract

1. Ensure `node` dependencies are installed (`npm install`).
2. Provide the deployer's private key and (optionally) a custom Base RPC endpoint:

   ```bash
   export DEPLOYER_PRIVATE_KEY=0xabc123...
   export BASE_RPC_URL=https://rpc.ankr.com/base/fe0da18bd714518c9d7bb2736fc2b7432a179a7cac8d93e3f107569eee4f23e8 # optional
   npm run deploy:receipt
   ```

   The script compiles `TradeReceipt.sol`, deploys it to Base, waits for the
   transaction receipt, and writes the deployment metadata to
   `contracts/deployments/base-trade-receipt.json`.

3. Expose the deployed address to the Next.js application so casts can link to the
   notarised log by setting `NEXT_PUBLIC_TRADE_RECEIPT_ADDRESS` in `.env.local` (see
   `.env.local.example` for a ready-to-use template).

### Production deployment

TradeCast is already deployed on Base at `0xaf94ad1a7c0c9f3f988217c46dca5ea4665f57c0`.
The web client falls back to this address automatically, so you only need to override
`NEXT_PUBLIC_TRADE_RECEIPT_ADDRESS` if you ship your own copy or want to disable the
feature (set the value to `disabled`).

### Creating a receipt

To notarize a TradeCast payload call `notarize(bytes32 tradeTxHash, string payload)` on the
deployed contract. The emitted `TradeNotarized` event indexes the original trade transaction
hash so casts can deep-link directly to the Basescan event log:

```
https://basescan.org/address/<contract>#eventlog#address=<contract>&topic0=<event_topic>&topic1=<trade_tx_hash>
```

The UI automatically prefers this receipt link when present and falls back to the
raw transaction proof when the receipt contract has not been configured.

