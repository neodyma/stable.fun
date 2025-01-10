use crate::error::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_spl::token_interface::{
    self as token22, Mint as Mint22, MintTo as MintTo22, TokenAccount as Token22Account,
    TokenInterface,
};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut,
        constraint = user_usdc_account.owner == user.key(),
        constraint = user_usdc_account.mint == usdc_mint.key()
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    // #[account(
    //     init,
    //     payer = user,
    //     space = 8 + 1,
    //     seeds = [b"stablefun_escrow".as_ref(), user.key().as_ref()],
    //     bump
    // )]
    // pub user_usdc_escrow: Account<'info, Escrow>,

    // #[account(
    //     init_if_needed,
    //     payer = user,
    //     token::mint = usdc_mint,
    //     token::authority = user_usdc_escrow
    // )]
    // pub user_usdc_escrow_ata: Account<'info, TokenAccount>,

    // #[account(seeds = [b"stablefun_usdc"], bump)]
    // /// CHECK: PDA acting as usdc transfer authority
    // pub treasury_usdc_auth: AccountInfo<'info>,

    #[account(mut,
        constraint = treasury_usdc_account.mint == usdc_mint.key(),
        // token::authority = treasury_usdc_auth,
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

#[account]
pub struct Escrow {
    pub bump: u8,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&self, usdc_amount: u64, bump: u8) -> Result<()> {
        require!(usdc_amount > 0, StablefunError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: self.user_usdc_account.to_account_info(),
            to: self.treasury_usdc_account.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, usdc_amount)?;

        let exchange_rate = 0.96f64; // Adjust as needed
        let token_amount = (usdc_amount as f64 * exchange_rate).round() as u64;

        let cpi_mint_to_accounts = MintTo22 {
            mint: self.token_mint.to_account_info(),
            to: self.user_token_account.to_account_info(),
            authority: self.token_mint_auth.to_account_info(),
        };

        let seeds = &[b"stablefun_mint".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        let cpi_mint_to_ctx = CpiContext::new_with_signer(
            self.token22_program.to_account_info(),
            cpi_mint_to_accounts,
            signer,
        );
        token22::mint_to(cpi_mint_to_ctx, token_amount)?;

        Ok(())
    }
}
