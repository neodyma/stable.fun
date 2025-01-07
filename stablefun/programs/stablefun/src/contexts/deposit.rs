use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::error::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut,
        constraint = user_usdc_account.owner == user.key(),
        constraint = user_usdc_account.mint == usdc_mint.key()
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_usdc_account: Account<'info, TokenAccount>,

    /// User's token account to receive the minted tokens (destination)
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    /// Mint of the token to be minted
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut, address = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"))]
    pub usdc_mint: Account<'info, Mint>,

    #[account(seeds = [b"stablefun_mint".as_ref()], bump)]
    /// CHECK: we know this account
    pub mint_authority: AccountInfo<'info>,

    // pub switchboard: Account<'info, Feed>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, usdc_amount: u64, bump: u8) -> Result<()> {
        require!(usdc_amount > 0, StablefunError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: self.user_usdc_account.to_account_info(),
            to: self.treasury_usdc_account.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        let cpi_self = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_self, usdc_amount)?;

        // let exchange_rate = get_exchange_rate(&self.feed, &self.switchboard_program)?;
        let exchange_rate = 0_964_770i64; // usd/eur

        let token_amount =
            ((usdc_amount as f64) * (exchange_rate as f64) / 1_000_000.0).round() as u64;

        let cpi_mint_to_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.user_token_account.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        };

        let seeds = &[b"stablefun_mint".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_mint_to_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            cpi_mint_to_accounts,
            signer,
        );

        token::mint_to(cpi_mint_to_ctx, token_amount)?;

        Ok(())
    }
}
