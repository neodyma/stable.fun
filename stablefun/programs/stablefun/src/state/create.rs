use anchor_lang::prelude::*;
use anchor_metaplex::mpl_token_metadata::{MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH};

#[account]
#[derive(InitSpace)]
pub struct StablefunCoin {
    pub creator: Pubkey,
    #[max_len(MAX_NAME_LENGTH)]
    pub name: String,
    #[max_len(MAX_SYMBOL_LENGTH)]
    pub symbol: String,
    #[max_len(MAX_URI_LENGTH)]
    pub icon: String,
    pub fiat: SupportedBonds,
    pub mint: Pubkey,
}

#[derive(Clone, Copy, InitSpace, AnchorSerialize, AnchorDeserialize)]
pub enum SupportedBonds {
    USTRY, // USD
    EUROB, // EUR
    GILTS, // GBP
    CETES, // MXN
    TESOURO, // BRL
}
