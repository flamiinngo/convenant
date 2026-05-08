use anchor_lang::prelude::*;
use crate::state::{ProposalState, ProposalStatus, UserCommitment};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CommitToProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, ProposalState>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserCommitment::INIT_SPACE,
        seeds = [b"commitment", proposal_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_commitment: Account<'info, UserCommitment>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn commit_to_proposal(
    ctx: Context<CommitToProposal>,
    proposal_id: u64,
    encrypted_commitment: Vec<u8>,
    commitment_nonce: u128,
) -> Result<()> {
    let proposal = &ctx.accounts.proposal;
    let clock = Clock::get()?;

    require!(
        proposal.status == ProposalStatus::Voting,
        CovenantError::VotingClosed
    );
    require!(
        clock.unix_timestamp < proposal.voting_end,
        CovenantError::VotingClosed
    );
    require!(
        clock.unix_timestamp >= proposal.voting_start,
        CovenantError::VotingNotStarted
    );

    let commitment = &mut ctx.accounts.user_commitment;

    // overwrite any existing commitment
    commitment.proposal_id = proposal_id;
    commitment.user = ctx.accounts.user.key();
    commitment.encrypted_commitment = encrypted_commitment;
    commitment.commitment_nonce = commitment_nonce;
    commitment.timestamp = clock.unix_timestamp;
    commitment.bump = ctx.bumps.user_commitment;

    Ok(())
}
