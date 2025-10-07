"""High level utilities for operating TradeCast across many chains."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Mapping, Optional

from .chains.chain import ChainMetadata
from .chains.jsonrpc import JsonRpcClient
from .chains.registry import ChainRegistry


@dataclass
class RpcCallResult:
    """Represents the result of invoking a JSON-RPC method."""

    chain: ChainMetadata
    method: str
    result: object


class TradeCast:
    """Coordinates broadcasting and querying across multiple chains."""

    def __init__(self, registry: ChainRegistry, *, default_timeout: float = 10.0) -> None:
        self._registry = registry
        self._default_timeout = default_timeout

    @property
    def registry(self) -> ChainRegistry:
        return self._registry

    def available_chains(self) -> List[ChainMetadata]:
        """Return metadata for all registered chains."""

        return list(self._registry)

    def get_chain(self, name: str) -> ChainMetadata:
        """Retrieve metadata for a specific chain."""

        return self._registry.get(name)

    def call_rpc(
        self,
        method: str,
        *,
        chains: Optional[Iterable[str]] = None,
        params: Optional[Iterable[object]] = None,
        timeout: Optional[float] = None,
    ) -> List[RpcCallResult]:
        """Execute a JSON-RPC method across multiple chains.

        Args:
            method: JSON-RPC method name.
            chains: Optional list of chain names. If omitted, call across all
                registered chains.
            params: Parameters to send with the RPC call.
            timeout: Optional request timeout override.

        Returns:
            List of :class:`RpcCallResult` objects in the order invoked.
        """

        if chains is None:
            target_chains = list(self._registry)
        else:
            target_chains = [self._registry.get(name) for name in chains]

        call_timeout = timeout if timeout is not None else self._default_timeout
        results: List[RpcCallResult] = []

        for chain in target_chains:
            client = JsonRpcClient(chain.rpc_url, timeout=call_timeout)
            result = client.call(method, params)
            results.append(RpcCallResult(chain=chain, method=method, result=result))
        return results

    def broadcast_raw_transaction(
        self, raw_transaction: str, *, chains: Optional[Iterable[str]] = None, timeout: Optional[float] = None
    ) -> Dict[str, object]:
        """Broadcast a signed transaction to multiple chains."""

        responses: Dict[str, object] = {}
        for call in self.call_rpc(
            "eth_sendRawTransaction",
            chains=chains,
            params=[raw_transaction],
            timeout=timeout,
        ):
            responses[call.chain.name] = call.result
        return responses

    def fetch_latest_block_numbers(
        self, *, chains: Optional[Iterable[str]] = None, timeout: Optional[float] = None
    ) -> Mapping[str, int]:
        """Return the latest block number for the specified chains."""

        numbers: Dict[str, int] = {}
        for call in self.call_rpc("eth_blockNumber", chains=chains, timeout=timeout):
            if isinstance(call.result, str) and call.result.startswith("0x"):
                numbers[call.chain.name] = int(call.result, 16)
            elif isinstance(call.result, int):
                numbers[call.chain.name] = call.result
            else:  # pragma: no cover - depends on remote RPC implementation
                raise TypeError(f"Unexpected block number format for {call.chain.name}: {call.result!r}")
        return numbers
