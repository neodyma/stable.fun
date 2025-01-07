use anchor_lang::prelude::*;

declare_id!("STBL1grL2qPy4fzVk7Ko2kY8Cb7EwKRYaGHaAptNdSr");

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
        let bump = ctx.bumps.mint_authority;
        ctx.accounts.deposit(deposit_amount, bump)
    }

    // burn the coin from the user and return their deposit
    pub fn redeem_stablecoin(_ctx: Context<Todo>) -> Result<()> {
        todo!();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Todo {}

#[derive(Accounts)]
pub struct Initialize {}
