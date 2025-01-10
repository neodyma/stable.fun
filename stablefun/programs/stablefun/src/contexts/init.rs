use anchor_lang::prelude::*;

use crate::StablefunMarket;

#[derive(Accounts)]
pub struct InitStablefun<'info> {
    pub system_program: Program<'info, System>,
    // #[account(init, payer = user, space = StablefunMarket::INIT_SPACE + 8, seeds = [b"stablefun".as_ref()], bump)]
    // pub stablefun_market: Account<'info, StablefunMarket>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(init,
        payer = user,
        space = 8 + 8,
        seeds = [b"stablefun_usdc".as_ref()],
        bump
    )]
    /// CHECK: PDA for usdc transfer authority
    pub stablefun_usdc_authority: AccountInfo<'info>,
}

impl<'info> InitStablefun<'info> {
    pub fn initialize(&mut self) -> Result<()> {
        // self.stablefun_market.owner = pubkey!("STBLENdv2myCCC2aa2ehHukTK9UvK9vxrMbAh4JtWHq");
        // self.stablefun_market.token_count = 0;
        Ok(())
    }
}
