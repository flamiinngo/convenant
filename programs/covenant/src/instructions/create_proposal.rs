use anchor_lang::prelude::*;
use crate::state::{ProposalState, ProposalStatus};

#[derive(Accounts)]
#[instruction(proposal_id: u64)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + ProposalState::INIT_SPACE,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, ProposalState>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    proposal_id: u64,
    title: String,
    description: String,
    option_a: String,
    option_b: String,
    voting_end: i64,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let clock = Clock::get()?;

    proposal.proposal_id = proposal_id;
    proposal.creator = ctx.accounts.creator.key();
    proposal.title = title;
    proposal.description = description;
    proposal.option_a = option_a;
    proposal.option_b = option_b;
    proposal.voting_start = clock.unix_timestamp;
    proposal.voting_end = voting_end;
    proposal.status = ProposalStatus::Voting;
    proposal.tally_nonce = 0;
    proposal.result_option_a = 0;
    proposal.result_option_b = 0;
    proposal.zk_proof = vec![];
    proposal.bump = ctx.bumps.proposal;

    Ok(())
}
