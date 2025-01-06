use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StablefunMarket {
    pub owner: Pubkey,
    // #[max_len(32)]
    // pub tokens: Vec<Pubkey>,
    pub token_count: u32,
}
