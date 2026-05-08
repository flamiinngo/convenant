use anchor_lang::prelude::*;
use crate::state::{CommunityState, MemberState};
use crate::errors::CovenantError;

#[derive(Accounts)]
#[instruction(community_id: u64)]
pub struct JoinCommunity<'info> {
    #[account(
        mut,
        seeds = [b"community", community_id.to_le_bytes().as_ref()],
        bump  = community.bump
    )]
    pub community: Account<'info, CommunityState>,

    #[account(
        init,
        payer = user,
        space = 8 + MemberState::INIT_SPACE,
        seeds = [b"member", community_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub member_state: Account<'info, MemberState>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn join_community(ctx: Context<JoinCommunity>, community_id: u64) -> Result<()> {
    let clock = Clock::get()?;

    let member = &mut ctx.accounts.member_state;
    member.community_id = community_id;
    member.member       = ctx.accounts.user.key();
    member.joined_at    = clock.unix_timestamp;
    member.bump         = ctx.bumps.member_state;

    ctx.accounts.community.member_count += 1;

    Ok(())
}
