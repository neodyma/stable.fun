use anchor_lang::prelude::*;

declare_id!("STBLENdv2myCCC2aa2ehHukTK9UvK9vxrMbAh4JtWHq");

mod error;
use error::*;

mod contexts;
use contexts::*;

mod state;
use state::*;

#[program]
pub mod stablefun {
    use super::*;

    pub fn initialize(ctx: Context<InitStablefun>) -> Result<()> {
        ctx.accounts.initialize()
    }

    // token name, symbol, icon url, target fiat / bond
    pub fn create_stablecoin(
        ctx: Context<CreateStablefunCoin>,
        name: String,
        symbol: String,
        icon: String,
        fiat: String,
    ) -> Result<()> {
        ctx.accounts.create(name, symbol, icon, fiat)
    }

    // mint a stablecoin to the user in exchange for their deposit
    pub fn deposit_fiat(ctx: Context<Deposit>, deposit_amount: u64) -> Result<()> {
        let bump = ctx.bumps.token_mint_auth;

        // ctx.accounts.user_usdc_escrow.bump = ctx.bumps.user_usdc_escrow;

        ctx.accounts.deposit(deposit_amount, bump)
    }

    // burn the coin from the user and return their deposit
    pub fn redeem_token(ctx: Context<Redeem>, redeem_amount: u64) -> Result<()> {
        let usdc_bump = ctx.bumps.treasury_usdc_auth;
        let mint_auth_bump = ctx.bumps.token_mint_auth;

        ctx.accounts.redeem(redeem_amount, usdc_bump, mint_auth_bump)
    }
}

#[derive(Accounts)]
pub struct Todo {}

#[derive(Accounts)]
pub struct Initialize {}
