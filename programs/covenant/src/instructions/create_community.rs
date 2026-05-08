use anchor_lang::prelude::*;
use crate::state::{CommunityState, MemberState, VotingRequirement};

#[derive(Accounts)]
#[instruction(community_id: u64)]
pub struct CreateCommunity<'info> {
    #[account(
        init,
        payer  = admin,
        space  = 8 + CommunityState::INIT_SPACE,
        seeds  = [b"community", community_id.to_le_bytes().as_ref()],
        bump
    )]
    pub community: Account<'info, CommunityState>,

    // Auto-enroll the admin as the first member.
    #[account(
        init,
        payer  = admin,
        space  = 8 + MemberState::INIT_SPACE,
        seeds  = [b"member", community_id.to_le_bytes().as_ref(), admin.key().as_ref()],
        bump
    )]
    pub admin_member: Account<'info, MemberState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_community(
    ctx: Context<CreateCommunity>,
    community_id: u64,
    name: String,
    description: String,
    voting_requirement: VotingRequirement,
) -> Result<()> {
    let clock = Clock::get()?;

    let community = &mut ctx.accounts.community;
    community.community_id       = community_id;
    community.admin               = ctx.accounts.admin.key();
    community.name                = name;
    community.description         = description;
    community.voting_requirement  = voting_requirement;
    community.member_count        = 1;
    community.proposal_count      = 0;
    community.created_at          = clock.unix_timestamp;
    community.bump                = ctx.bumps.community;

    let member = &mut ctx.accounts.admin_member;
    member.community_id = community_id;
    member.member       = ctx.accounts.admin.key();
    member.joined_at    = clock.unix_timestamp;
    member.bump         = ctx.bumps.admin_member;

    Ok(())
}
