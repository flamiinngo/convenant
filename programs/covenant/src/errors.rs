use anchor_lang::prelude::*;

#[error_code]
pub enum CovenantError {
    #[msg("voting window has not opened yet")]
    VotingNotStarted,
    #[msg("voting window is closed")]
    VotingClosed,
    #[msg("voting is still active")]
    VotingStillActive,
    #[msg("tally has not been triggered")]
    TallyNotStarted,
    #[msg("proposal already finalized")]
    AlreadyFinalized,
    #[msg("not authorized")]
    Unauthorized,
    #[msg("invalid zk proof")]
    InvalidProof,
    // Community errors
    #[msg("already a member of this community")]
    AlreadyMember,
    #[msg("admin cannot leave the community")]
    AdminCannotLeave,
    #[msg("proposal does not belong to this community")]
    WrongCommunity,
    // Voting requirement errors
    #[msg("token account is required for this community")]
    TokenAccountRequired,
    #[msg("token account has wrong mint")]
    WrongTokenMint,
    #[msg("token account has wrong owner")]
    WrongTokenOwner,
    #[msg("insufficient token balance to vote")]
    InsufficientTokenBalance,
    #[msg("invalid token account data")]
    InvalidTokenAccount,
}
