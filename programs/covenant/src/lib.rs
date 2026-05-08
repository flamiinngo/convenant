use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

const COMP_DEF_OFFSET_TALLY_VOTE:         u32 = comp_def_offset("tally_vote");
const COMP_DEF_OFFSET_REVEAL_TALLY:       u32 = comp_def_offset("reveal_tally");
const COMP_DEF_OFFSET_GET_WINNING_OPTION: u32 = comp_def_offset("get_winning_option");

declare_id!("6mk5vkuRHtsUH97bqGKKLoqfj113SQwAThVLw5GyQDYx");

#[arcium_program]
pub mod covenant {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: u64,
        title: String,
        description: String,
        option_a: String,
        option_b: String,
        voting_end: i64,
    ) -> Result<()> {
        instructions::create_proposal::create_proposal(
            ctx, proposal_id, title, description, option_a, option_b, voting_end,
        )
    }

    pub fn commit_to_proposal(
        ctx: Context<CommitToProposal>,
        proposal_id: u64,
        encrypted_commitment: Vec<u8>,
        commitment_nonce: u128,
    ) -> Result<()> {
        instructions::commit_to_proposal::commit_to_proposal(
            ctx, proposal_id, encrypted_commitment, commitment_nonce,
        )
    }

    pub fn voting_closes(ctx: Context<VotingCloses>, proposal_id: u64) -> Result<()> {
        instructions::voting_closes::voting_closes(ctx, proposal_id)
    }

    pub fn execute_commitments(
        ctx: Context<ExecuteCommitments>,
        proposal_id: u64,
        result_a: u64,
        result_b: u64,
        tally_nonce: u128,
        zk_proof: Vec<u8>,
    ) -> Result<()> {
        instructions::execute_commitments::execute_commitments(
            ctx, proposal_id, result_a, result_b, tally_nonce, zk_proof,
        )
    }

    pub fn finalize_proposal(ctx: Context<FinalizeProposal>, proposal_id: u64) -> Result<()> {
        instructions::finalize_proposal::finalize_proposal(ctx, proposal_id)
    }

    pub fn init_tally_vote_comp_def(ctx: Context<InitTallyVoteCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }

    pub fn init_reveal_tally_comp_def(ctx: Context<InitRevealTallyCompDef>) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }

    pub fn init_get_winning_option_comp_def(
        ctx: Context<InitGetWinningOptionCompDef>,
    ) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }
}

#[init_computation_definition_accounts("tally_vote", payer)]
#[derive(Accounts)]
pub struct InitTallyVoteCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: not initialized yet
    pub comp_def_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
    /// CHECK: address lookup table
    pub address_lookup_table: UncheckedAccount<'info>,
    #[account(address = LUT_PROGRAM_ID)]
    /// CHECK: lut program
    pub lut_program: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("reveal_tally", payer)]
#[derive(Accounts)]
pub struct InitRevealTallyCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: not initialized yet
    pub comp_def_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
    /// CHECK: address lookup table
    pub address_lookup_table: UncheckedAccount<'info>,
    #[account(address = LUT_PROGRAM_ID)]
    /// CHECK: lut program
    pub lut_program: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[init_computation_definition_accounts("get_winning_option", payer)]
#[derive(Accounts)]
pub struct InitGetWinningOptionCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: not initialized yet
    pub comp_def_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
    /// CHECK: address lookup table
    pub address_lookup_table: UncheckedAccount<'info>,
    #[account(address = LUT_PROGRAM_ID)]
    /// CHECK: lut program
    pub lut_program: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}
