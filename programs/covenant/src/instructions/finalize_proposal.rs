use anchor_lang::prelude::*;
use crate::state::{ProposalState, ProposalStatus};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct FinalizeProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, ProposalState>,

    pub authority: Signer<'info>,
}

#[event]
pub struct ProposalFinalized {
    pub proposal_id: u64,
    pub result_a: u64,
    pub result_b: u64,
    pub winner: u8,
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>, proposal_id: u64) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;

    require!(
        proposal.status == ProposalStatus::TallyStarted,
        CovenantError::AlreadyFinalized
    );
    require!(proposal.tally_nonce != 0, CovenantError::TallyNotStarted);

    proposal.status = ProposalStatus::Finalized;

    let winner = if proposal.result_option_a >= proposal.result_option_b {
        0u8
    } else {
        1u8
    };

    emit!(ProposalFinalized {
        proposal_id,
        result_a: proposal.result_option_a,
        result_b: proposal.result_option_b,
        winner,
    });

    Ok(())
}
