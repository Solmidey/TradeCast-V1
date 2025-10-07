"""Minimal JSON-RPC client used by TradeCast."""

from __future__ import annotations

import json
import itertools
from typing import Any, Iterable, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen


class JsonRpcError(RuntimeError):
    """Raised when a JSON-RPC call fails."""


class JsonRpcClient:
    """Tiny JSON-RPC client suitable for blockchain RPC endpoints."""

    def __init__(self, url: str, *, timeout: Optional[float] = None) -> None:
        self._url = url
        self._timeout = timeout
        self._ids = itertools.count(1)

    def call(self, method: str, params: Optional[Iterable[Any]] = None) -> Any:
        """Perform a JSON-RPC call against the configured endpoint."""

        request_id = next(self._ids)
        payload = json.dumps(
            {
                "jsonrpc": "2.0",
                "id": request_id,
                "method": method,
                "params": list(params) if params is not None else [],
            }
        ).encode("utf-8")

        request = Request(
            self._url,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "TradeCast/1.0"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=self._timeout) as response:
                body = response.read()
        except URLError as exc:  # pragma: no cover - network errors in tests
            raise JsonRpcError(str(exc)) from exc

        try:
            data = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as exc:  # pragma: no cover - dependent on remote data
            raise JsonRpcError("Invalid JSON-RPC response") from exc

        if isinstance(data, dict) and "error" in data:
            error = data["error"]
            if isinstance(error, dict):
                message = error.get("message", "Unknown error")
                code = error.get("code")
                raise JsonRpcError(f"RPC error {code}: {message}")
            raise JsonRpcError(str(error))
        if isinstance(data, dict) and "result" in data:
            return data["result"]
        raise JsonRpcError("Malformed JSON-RPC response")
