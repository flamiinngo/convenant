use anchor_lang::prelude::*;
use crate::state::{ProposalState, ProposalStatus};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct VotingCloses<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, ProposalState>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn voting_closes(ctx: Context<VotingCloses>, _proposal_id: u64) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let clock = Clock::get()?;

    require!(
        proposal.status == ProposalStatus::Voting,
        CovenantError::AlreadyFinalized
    );
    require!(
        clock.unix_timestamp >= proposal.voting_end,
        CovenantError::VotingStillActive
    );

    proposal.status = ProposalStatus::TallyStarted;
    proposal.tally_nonce = 0;

    Ok(())
}
