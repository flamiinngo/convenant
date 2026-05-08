use anchor_lang::prelude::*;
use crate::state::{CommunityState, MemberState, ProposalState, ProposalStatus, VotingRequirement};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(community_id: u64, proposal_id: u64)]
pub struct CommitToProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal_id.to_le_bytes().as_ref()],
        bump  = proposal.bump,
        constraint = proposal.community_id == community_id @ CovenantError::WrongCommunity
    )]
    pub proposal: Account<'info, ProposalState>,

    #[account(
        seeds = [b"community", community_id.to_le_bytes().as_ref()],
        bump  = community.bump
    )]
    pub community: Account<'info, CommunityState>,

    // Proves the voter is a community member.
    #[account(
        seeds = [b"member", community_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump  = member_state.bump
    )]
    pub member_state: Account<'info, MemberState>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + crate::state::UserCommitment::INIT_SPACE,
        seeds = [b"commitment", proposal_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_commitment: Account<'info, crate::state::UserCommitment>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    // remaining_accounts[0] = voter token account (required for TokenGated / NftGated)
}

// Raw SPL token account field offsets (compatible with Token and Token-2022).
fn token_mint(data: &[u8]) -> Result<Pubkey> {
    require!(data.len() >= 32, CovenantError::InvalidTokenAccount);
    Ok(Pubkey::try_from(&data[0..32]).unwrap())
}
fn token_owner(data: &[u8]) -> Result<Pubkey> {
    require!(data.len() >= 64, CovenantError::InvalidTokenAccount);
    Ok(Pubkey::try_from(&data[32..64]).unwrap())
}
fn token_amount(data: &[u8]) -> Result<u64> {
    require!(data.len() >= 72, CovenantError::InvalidTokenAccount);
    Ok(u64::from_le_bytes(data[64..72].try_into().unwrap()))
}

pub fn commit_to_proposal(
    ctx: Context<CommitToProposal>,
    _community_id: u64,
    proposal_id: u64,
    encrypted_commitment: Vec<u8>,
    commitment_nonce: u128,
) -> Result<()> {
    let proposal = &ctx.accounts.proposal;
    let clock     = Clock::get()?;

    require!(proposal.status == ProposalStatus::Voting, CovenantError::VotingClosed);
    require!(clock.unix_timestamp < proposal.voting_end,    CovenantError::VotingClosed);
    require!(clock.unix_timestamp >= proposal.voting_start, CovenantError::VotingNotStarted);

    // ── Voting requirement check ────────────────────────────────────────────
    match &ctx.accounts.community.voting_requirement {
        VotingRequirement::Open => {}

        VotingRequirement::TokenGated { mint, min_amount } => {
            let acct = ctx.remaining_accounts
                .first()
                .ok_or(CovenantError::TokenAccountRequired)?;
            let data = acct.try_borrow_data()?;
            require_keys_eq!(token_mint(&data)?,  *mint,                    CovenantError::WrongTokenMint);
            require_keys_eq!(token_owner(&data)?, ctx.accounts.user.key(),  CovenantError::WrongTokenOwner);
            require!(token_amount(&data)? >= *min_amount,                   CovenantError::InsufficientTokenBalance);
        }

        VotingRequirement::NftGated { collection_mint } => {
            let acct = ctx.remaining_accounts
                .first()
                .ok_or(CovenantError::TokenAccountRequired)?;
            let data = acct.try_borrow_data()?;
            require_keys_eq!(token_mint(&data)?,  *collection_mint,         CovenantError::WrongTokenMint);
            require_keys_eq!(token_owner(&data)?, ctx.accounts.user.key(),  CovenantError::WrongTokenOwner);
            require!(token_amount(&data)? >= 1,                             CovenantError::InsufficientTokenBalance);
        }
    }

    // ── Store commitment ────────────────────────────────────────────────────
    let commitment = &mut ctx.accounts.user_commitment;
    commitment.proposal_id           = proposal_id;
    commitment.user                  = ctx.accounts.user.key();
    commitment.encrypted_commitment  = encrypted_commitment;
    commitment.commitment_nonce      = commitment_nonce;
    commitment.timestamp             = clock.unix_timestamp;
    commitment.bump                  = ctx.bumps.user_commitment;

    ctx.accounts.proposal.commitment_count += 1;

    Ok(())
}
