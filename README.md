# TradeCast-V1

A tradecasting system on Farcaster.

## Multi-chain support

This repository now includes a lightweight Python module that lets TradeCast
interact with multiple EVM-compatible chains through JSON-RPC calls. Chains are
configured through JSON files and loaded into a registry that the `TradeCast`
class uses to broadcast transactions or execute queries on multiple networks at
once.

### Getting started

1. Create a virtual environment and install dependencies (there are no external
   dependencies for the base module, but you can install `pytest` if you want to
   run the unit tests).
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

### Testing

To run the tests (optional):

```bash
pytest
```
