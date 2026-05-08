use anchor_lang::prelude::*;

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
    pub proposal_id: u64,
    pub creator: Pubkey,
    #[max_len(256)]
    pub title: String,
    #[max_len(2048)]
    pub description: String,
    #[max_len(128)]
    pub option_a: String,
    #[max_len(128)]
    pub option_b: String,
    pub voting_start: i64,
    pub voting_end: i64,
    pub status: ProposalStatus,
    pub tally_nonce: u128,
    pub result_option_a: u64,
    pub result_option_b: u64,
    #[max_len(1024)]
    pub zk_proof: Vec<u8>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserCommitment {
    pub proposal_id: u64,
    pub user: Pubkey,
    #[max_len(1024)]
    pub encrypted_commitment: Vec<u8>,
    pub commitment_nonce: u128,
    pub timestamp: i64,
    pub bump: u8,
}
