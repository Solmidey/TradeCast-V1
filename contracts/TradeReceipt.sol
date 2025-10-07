// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TradeReceipt
/// @notice Emits immutable onchain receipts for TradeCast payloads so casts can cite
///         an event log that survives beyond third-party APIs.
contract TradeReceipt {
    /// @notice Emitted when a trade payload is notarized.
    /// @param submitter Address that notarized the payload.
    /// @param tradeTxHash Transaction hash of the underlying onchain trade being notarized.
    /// @param payloadHash Keccak-256 hash of the plaintext payload for quick comparisons.
    /// @param payload Full plaintext payload that can be rendered in Warpcast or a frame.
    /// @param timestamp Block timestamp when the payload was notarized.
    event TradeNotarized(
        address indexed submitter,
        bytes32 indexed tradeTxHash,
        bytes32 indexed payloadHash,
        string payload,
        uint256 timestamp
    );

    /// @notice Notarize a trade payload by emitting an event containing its metadata.
    /// @dev Returns the payload hash so callers can surface it in the UI immediately.
    /// @param tradeTxHash Transaction hash of the original trade on Base.
    /// @param payload The plaintext payload that should be preserved onchain.
    /// @return payloadHash Hash of the payload that is also indexed in the event topics.
    function notarize(bytes32 tradeTxHash, string calldata payload)
        external
        returns (bytes32 payloadHash)
    {
        payloadHash = keccak256(bytes(payload));
        emit TradeNotarized(msg.sender, tradeTxHash, payloadHash, payload, block.timestamp);
    }
}
