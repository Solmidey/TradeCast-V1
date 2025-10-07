from pathlib import Path
import json
import sys

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from tradecast.chains.chain import ChainMetadata
from tradecast.chains.registry import ChainRegistry, load_chains_from_file, load_chains_from_dict


def test_chain_metadata_roundtrip():
    metadata = ChainMetadata(
        name="TestChain",
        chain_id=999,
        rpc_url="https://example.com",
        currency_symbol="TST",
        explorer_url="https://explorer.example.com",
        tags=("test", "evm"),
    )
    payload = metadata.to_dict()
    reconstructed = ChainMetadata.from_dict(payload)
    assert reconstructed == metadata


def test_registry_register_and_get():
    registry = ChainRegistry()
    registry.register(
        ChainMetadata(
            name="ChainA", chain_id=1, rpc_url="https://a", currency_symbol="A"
        )
    )
    assert registry.get("ChainA").chain_id == 1

    with pytest.raises(ValueError):
        registry.register(
            ChainMetadata(
                name="ChainA", chain_id=2, rpc_url="https://b", currency_symbol="B"
            )
        )

    with pytest.raises(KeyError):
        registry.get("unknown")


def test_load_chains_from_dict():
    registry = load_chains_from_dict(
        [
            {"name": "A", "chain_id": 1, "rpc_url": "https://a", "currency_symbol": "A"},
            {"name": "B", "chain_id": 2, "rpc_url": "https://b", "currency_symbol": "B"},
        ]
    )
    assert len(list(registry)) == 2


def test_load_chains_from_file(tmp_path: Path):
    config = [
        {"name": "A", "chain_id": 1, "rpc_url": "https://a", "currency_symbol": "A"},
        {"name": "B", "chain_id": 2, "rpc_url": "https://b", "currency_symbol": "B"},
    ]
    config_path = tmp_path / "chains.json"
    config_path.write_text(json.dumps(config), encoding="utf-8")

    registry = load_chains_from_file(config_path)
    assert registry.get("A").chain_id == 1
    assert registry.get("B").chain_id == 2


def test_tradecast_fetch_latest_block_numbers(monkeypatch):
    from tradecast.multichain import TradeCast

    chains = [
        {"name": "ChainA", "chain_id": 1, "rpc_url": "https://a", "currency_symbol": "A"},
        {"name": "ChainB", "chain_id": 2, "rpc_url": "https://b", "currency_symbol": "B"},
    ]
    registry = load_chains_from_dict(chains)
    client = TradeCast(registry)

    calls = []

    class FakeClient:
        def __init__(self, url, timeout=None):
            self.url = url
            self.timeout = timeout

        def call(self, method, params=None):
            calls.append((self.url, method, tuple(params or [])))
            return "0x10"

    monkeypatch.setattr("tradecast.multichain.JsonRpcClient", FakeClient)

    result = client.fetch_latest_block_numbers()
    assert result == {"ChainA": 16, "ChainB": 16}
    assert len(calls) == 2
    assert calls[0][1] == "eth_blockNumber"
