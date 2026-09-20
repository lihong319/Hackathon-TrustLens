module trust_lens::verification;

use std::string::String;
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

/// A privacy-safe record proving that TrustLens analyzed a content hash.
/// The original submitted content is deliberately never stored on-chain.
public struct Verification has key, store {
    id: UID,
    verification_id: String,
    content_hash: vector<u8>,
    result_hash: vector<u8>,
    trust_score: u8,
    risk_level: u8,
    created_at_ms: u64,
    gonka_request_ids: vector<String>,
    owner: address,
}

/// Creates an immutable-at-creation verification object owned by the caller.
public fun create_verification(
    verification_id: String,
    content_hash: vector<u8>,
    result_hash: vector<u8>,
    trust_score: u8,
    risk_level: u8,
    created_at_ms: u64,
    gonka_request_ids: vector<String>,
    ctx: &mut TxContext,
) {
    let owner = tx_context::sender(ctx);
    let proof = Verification {
        id: object::new(ctx),
        verification_id,
        content_hash,
        result_hash,
        trust_score,
        risk_level,
        created_at_ms,
        gonka_request_ids,
        owner,
    };
    transfer::transfer(proof, owner);
}
