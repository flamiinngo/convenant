use anchor_lang::prelude::*;
use crate::state::{CommunityState, MemberState};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(community_id: u64)]
pub struct LeaveCommunity<'info> {
    #[account(
        mut,
        seeds = [b"community", community_id.to_le_bytes().as_ref()],
        bump  = community.bump
    )]
    pub community: Account<'info, CommunityState>,

    #[account(
        mut,
        close  = user,
        seeds  = [b"member", community_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump   = member_state.bump,
        constraint = member_state.member == user.key() @ CovenantError::Unauthorized
    )]
    pub member_state: Account<'info, MemberState>,

    #[account(mut)]
    pub user: Signer<'info>,
}

pub fn leave_community(ctx: Context<LeaveCommunity>, _community_id: u64) -> Result<()> {
    require_keys_neq!(
        ctx.accounts.community.admin,
        ctx.accounts.user.key(),
        CovenantError::AdminCannotLeave
    );

    ctx.accounts.community.member_count =
        ctx.accounts.community.member_count.saturating_sub(1);

    Ok(())
}
