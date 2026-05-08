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
}
