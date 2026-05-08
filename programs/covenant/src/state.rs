use anchor_lang::prelude::*;

// ── Voting requirement ────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VotingRequirement {
    /// Any joined member may vote.
    Open,
    /// Voter must hold ≥ min_amount of the specified SPL token.
    TokenGated { mint: Pubkey, min_amount: u64 },
    /// Voter must hold ≥ 1 token from the specified NFT collection mint.
    NftGated { collection_mint: Pubkey },
}

// ── Community ─────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct CommunityState {
    pub community_id:        u64,
    pub admin:               Pubkey,
    #[max_len(64)]
    pub name:                String,
    #[max_len(256)]
    pub description:         String,
    pub voting_requirement:  VotingRequirement,
    pub member_count:        u64,
    pub proposal_count:      u64,
    pub created_at:          i64,
    pub bump:                u8,
}

// ── Member ────────────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct MemberState {
    pub community_id: u64,
    pub member:       Pubkey,
    pub joined_at:    i64,
    pub bump:         u8,
}

// ── Proposal ──────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProposalStatus {
    Created,
    Voting,
    TallyStarted,
    Finalized,
}

#[account]
#[derive(InitSpace)]
pub struct ProposalState {
    pub community_id:     u64,
    pub proposal_id:      u64,
    pub creator:          Pubkey,
    #[max_len(256)]
    pub title:            String,
    #[max_len(2048)]
    pub description:      String,
    #[max_len(128)]
    pub option_a:         String,
    #[max_len(128)]
    pub option_b:         String,
    pub voting_start:     i64,
    pub voting_end:       i64,
    pub status:           ProposalStatus,
    pub commitment_count: u64,
    pub tally_nonce:      u128,
    pub result_option_a:  u64,
    pub result_option_b:  u64,
    #[max_len(1024)]
    pub zk_proof:         Vec<u8>,
    pub bump:             u8,
}

// ── User commitment ───────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct UserCommitment {
    pub proposal_id:           u64,
    pub user:                  Pubkey,
    #[max_len(1024)]
    pub encrypted_commitment:  Vec<u8>,
    pub commitment_nonce:      u128,
    pub timestamp:             i64,
    pub bump:                  u8,
}
