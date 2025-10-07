"""Chain metadata representation for TradeCast."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, Optional


@dataclass(frozen=True)
class ChainMetadata:
    """Describes a blockchain supported by TradeCast.

    Attributes:
        name: Human readable chain name (e.g. "Ethereum").
        chain_id: EVM chain id as an integer.
        rpc_url: HTTPS endpoint for JSON-RPC calls.
        currency_symbol: Symbol of the native token (e.g. "ETH").
        explorer_url: Optional base URL for the chain's block explorer.
        tags: Optional set of free-form tags describing the chain.
    """

    name: str
    chain_id: int
    rpc_url: str
    currency_symbol: str
    explorer_url: Optional[str] = None
    tags: Iterable[str] = field(default_factory=tuple)

    def to_dict(self) -> Dict[str, object]:
        """Return a serialisable dictionary representation."""

        return {
            "name": self.name,
            "chain_id": self.chain_id,
            "rpc_url": self.rpc_url,
            "currency_symbol": self.currency_symbol,
            "explorer_url": self.explorer_url,
            "tags": list(self.tags),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, object]) -> "ChainMetadata":
        """Create :class:`ChainMetadata` from a dictionary."""

        missing_keys = {"name", "chain_id", "rpc_url", "currency_symbol"} - data.keys()
        if missing_keys:
            missing = ", ".join(sorted(missing_keys))
            raise ValueError(f"Missing required chain keys: {missing}")

        tags_data = data.get("tags")
        tags: Iterable[str]
        if tags_data is None:
            tags = ()
        elif isinstance(tags_data, (list, tuple, set)):
            tags = tuple(str(tag) for tag in tags_data)
        else:
            raise TypeError("tags must be a sequence of strings")

        return cls(
            name=str(data["name"]),
            chain_id=int(data["chain_id"]),
            rpc_url=str(data["rpc_url"]),
            currency_symbol=str(data["currency_symbol"]),
            explorer_url=(None if data.get("explorer_url") is None else str(data["explorer_url"])),
            tags=tags,
        )
