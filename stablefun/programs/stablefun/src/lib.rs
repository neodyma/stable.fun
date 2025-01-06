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

    // we are able to check all created coins using the approach documented here:
    // https://solana.com/developers/cookbook/tokens/get-all-token-accounts

    // mint a stablecoin to the user
    pub fn mint_stablecoin(_ctx: Context<Todo>) -> Result<()> {
        todo!();
        Ok(())
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
