use anchor_lang::prelude::*;

use crate::error::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub stablefun_market: Account<'info, StablefunMarket>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}
