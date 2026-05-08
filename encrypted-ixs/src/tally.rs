use arcis::*;

#[encrypted]
mod instructions {
    use arcis::*;

    // Called once per commitment. Accumulates encrypted running totals inside the MXE.
    // vote=0 means option A, vote=1 means option B.
    #[instruction]
    fn tally_vote(
        encrypted_vote: Enc<Mxe, u8>,
        count_a: Enc<Mxe, u64>,
        count_b: Enc<Mxe, u64>,
    ) -> (Enc<Mxe, u64>, Enc<Mxe, u64>) {
        let vote: u8  = encrypted_vote.to_arcis();
        let a:    u64 = count_a.to_arcis();
        let b:    u64 = count_b.to_arcis();

        let is_b = vote as u64;
        let is_a = 1u64 - is_b;

        let new_a = a + is_a;
        let new_b = b + is_b;

        (Mxe::get().from_arcis(new_a), Mxe::get().from_arcis(new_b))
    }

    // Final step — reveals the accumulated counts publicly.
    #[instruction]
    fn reveal_tally(
        count_a: Enc<Mxe, u64>,
        count_b: Enc<Mxe, u64>,
    ) -> (u64, u64) {
        let a = count_a.to_arcis().reveal();
        let b = count_b.to_arcis().reveal();
        (a, b)
    }
}
