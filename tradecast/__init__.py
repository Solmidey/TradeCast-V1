"""TradeCast multi-chain support package."""

from .chains.registry import ChainRegistry, load_chains_from_file
from .multichain import TradeCast

__all__ = [
    "ChainRegistry",
    "TradeCast",
    "load_chains_from_file",
]
