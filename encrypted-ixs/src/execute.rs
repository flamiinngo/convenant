use arcis::*;

#[encrypted]
mod instructions {
    use arcis::*;

    // Compares revealed totals and returns the winning option (0=A, 1=B).
    #[instruction]
    fn get_winning_option(
        count_a: Enc<Mxe, u64>,
        count_b: Enc<Mxe, u64>,
    ) -> u8 {
        let a = count_a.to_arcis().reveal();
        let b = count_b.to_arcis().reveal();
        if a >= b { 0u8 } else { 1u8 }
    }
}
