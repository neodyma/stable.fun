use anchor_lang::prelude::*;

use crate::StablefunMarket;

#[derive(Accounts)]
pub struct InitStablefun<'info> {
    pub system_program: Program<'info, System>,
    #[account(init, payer = user, space = StablefunMarket::INIT_SPACE + 8, seeds = [b"stablefun".as_ref()], bump)]
    pub stablefun_market: Account<'info, StablefunMarket>,
    #[account(mut)]
    pub user: Signer<'info>,
}

impl<'info> InitStablefun<'info> {
    pub fn initialize(&mut self) -> Result<()> {
        self.stablefun_market.owner = pubkey!("STBL1grL2qPy4fzVk7Ko2kY8Cb7EwKRYaGHaAptNdSr");
        self.stablefun_market.token_count = 0;
        Ok(())
    }
}
