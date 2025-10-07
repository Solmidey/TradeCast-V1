"""Registry and configuration loading helpers for TradeCast chains."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Mapping, MutableMapping

from .chain import ChainMetadata


class ChainRegistry:
    """Stores metadata about chains supported by TradeCast."""

    def __init__(self) -> None:
        self._chains: Dict[str, ChainMetadata] = {}

    def __contains__(self, name: str) -> bool:  # pragma: no cover - trivial
        return name.lower() in self._chains

    def __iter__(self) -> Iterator[ChainMetadata]:
        return iter(self._chains.values())

    def __len__(self) -> int:
        return len(self._chains)

    def register(self, chain: ChainMetadata) -> None:
        """Register a new chain with the registry."""

        key = chain.name.lower()
        if key in self._chains:
            raise ValueError(f"Chain '{chain.name}' already registered")
        self._chains[key] = chain

    def get(self, name: str) -> ChainMetadata:
        """Retrieve metadata for ``name``.

        Args:
            name: Chain name (case insensitive).

        Returns:
            Chain metadata.

        Raises:
            KeyError: If the chain is not registered.
        """

        key = name.lower()
        if key not in self._chains:
            raise KeyError(f"Unknown chain '{name}'")
        return self._chains[key]

    def to_list(self) -> List[Mapping[str, object]]:
        """Return a JSON serialisable list of chain metadata."""

        return [chain.to_dict() for chain in self._chains.values()]


def load_chains_from_file(path: Path) -> ChainRegistry:
    """Load chain metadata from a JSON file."""

    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise TypeError("Chain configuration must be a list")

    registry = ChainRegistry()
    for entry in data:
        if not isinstance(entry, MutableMapping):
            raise TypeError("Each chain entry must be an object")
        registry.register(ChainMetadata.from_dict(dict(entry)))
    return registry


def load_chains_from_dict(data: Iterable[Mapping[str, object]]) -> ChainRegistry:
    """Load chain metadata from an iterable of dictionaries."""

    registry = ChainRegistry()
    for entry in data:
        registry.register(ChainMetadata.from_dict(dict(entry)))
    return registry
