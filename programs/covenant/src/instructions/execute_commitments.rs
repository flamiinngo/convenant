use anchor_lang::prelude::*;
use crate::state::{ProposalState, ProposalStatus};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct ExecuteCommitments<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, ProposalState>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn execute_commitments(
    ctx: Context<ExecuteCommitments>,
    _proposal_id: u64,
    result_a: u64,
    result_b: u64,
    tally_nonce: u128,
    zk_proof: Vec<u8>,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;

    require!(
        proposal.status == ProposalStatus::TallyStarted,
        CovenantError::TallyNotStarted
    );
    require!(!zk_proof.is_empty(), CovenantError::InvalidProof);

    proposal.result_option_a = result_a;
    proposal.result_option_b = result_b;
    proposal.tally_nonce = tally_nonce;
    proposal.zk_proof = zk_proof;

    Ok(())
}
