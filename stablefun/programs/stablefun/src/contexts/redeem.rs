use crate::error::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::token_interface::{
    self as token22, Burn as Burn22, Mint as Mint22, TokenAccount as Token22Account, TokenInterface,
};

use crate::Escrow;

#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut,
        constraint = user_usdc_account.owner == user.key(),
        constraint = user_usdc_account.mint == usdc_mint.key()
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    #[account(seeds = [b"stablefun_usdc"], bump)]
    /// CHECK: PDA acting as usdc transfer authority
    pub treasury_usdc_auth: AccountInfo<'info>,

    // #[account(
    //     mut,
    //     close = user,
    //     seeds = [b"stablefun_escrow".as_ref(), user.key().as_ref()],
    //     bump = user_usdc_escrow.bump
    // )]
    // pub user_usdc_escrow: Account<'info, Escrow>,

    // #[account(
    //     mut,
    //     token::mint = usdc_mint,
    //     token::authority = user_usdc_escrow
    // )]
    // pub user_usdc_escrow_ata: Account<'info, TokenAccount>,

    #[account(mut,
        constraint = treasury_usdc_account.mint == usdc_mint.key(),
        token::authority = treasury_usdc_auth,
    )]
    pub treasury_usdc_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, Token22Account>,

    #[account(mut,
        mint::token_program = token22_program.key()
    )]
    pub token_mint: InterfaceAccount<'info, Mint22>,

    #[account(mut, address = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"))]
    pub usdc_mint: Account<'info, Mint>,

    #[account(seeds = [b"stablefun_mint"], bump)]
    /// CHECK: This is a PDA derived from known seeds
    pub token_mint_auth: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub token22_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}

impl<'info> Redeem<'info> {
    pub fn redeem(&self, token_amount: u64, usdc_bump: u8, mint_bump: u8) -> Result<()> {
        require!(token_amount > 0, StablefunError::InvalidAmount);

        // let exchange_rate = 0.96f64; // Adjust as needed
        // let usdc_amount = (token_amount as f64 / exchange_rate).round() as u64;

        // let usdc_seeds = &[b"stablefun_usdc".as_ref(), &[usdc_bump]];
        // let usdc_signer = &[&usdc_seeds[..]];

        // let escrow_seeds = &[b"stablefun_escrow".as_ref(), user_key.as_ref(), &[self.user_usdc_escrow.bump]];
        // let escrow_signer = &[&escrow_seeds[..]];

        // let cpi_accounts = Transfer {
        //     from: self.treasury_usdc_account.to_account_info(),
        //     to: self.user_usdc_account.to_account_info(),
        //     authority: self.treasury_usdc_auth.to_account_info(),
        // };
        // let cpi_ctx = CpiContext::new_with_signer(
        //     self.token_program.to_account_info(),
        //     cpi_accounts,
        //     usdc_signer);
        // token::transfer(cpi_ctx, usdc_amount)?;

        let cpi_burn_accounts = Burn22 {
            mint: self.token_mint.to_account_info(),
            from: self.user_token_account.to_account_info(),
            authority: self.token_mint_auth.clone(),
        };

        let mint_seeds = &[b"stablefun_mint".as_ref(), &[mint_bump]];
        let mint_signer = &[&mint_seeds[..]];

        let cpi_burn_ctx = CpiContext::new_with_signer(
            self.token22_program.to_account_info(),
            cpi_burn_accounts,
            mint_signer,
        );
        token22::burn(cpi_burn_ctx, token_amount)?;

        Ok(())
    }
}
