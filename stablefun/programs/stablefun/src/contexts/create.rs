use anchor_lang::prelude::*;
use anchor_metaplex::mpl_token_metadata::{
    ID as MPL_TOKEN_METADATA_ID, MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
    types::Creator, types::DataV2
};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata, MetadataAccount},
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount },
};

use crate::error::*;

use crate::StablefunCoin;
use crate::StablefunMarket;
use crate::SupportedBonds;

#[derive(Accounts)]
pub struct CreateStablefunCoin<'info> {
    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub stablefun_market: Account<'info, StablefunMarket>,

    #[account(init,
        payer = user,
        space = StablefunCoin::INIT_SPACE + 8,
        seeds = [b"stablefun_coin".as_ref(), user.key().as_ref()],
        bump
    )]
    pub stablefun_coin: Account<'info, StablefunCoin>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(init,
        payer = user,
        mint::decimals = 9,
        mint::authority = stablefun_market,
        mint::freeze_authority = stablefun_market,
        seeds = [b"stablefun_mint".as_ref(), user.key().as_ref()],
        bump
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    //     mut,
    //     seeds = [
    //         b"metadata",
    //         MPL_TOKEN_METADATA_ID.as_ref(),
    //         token_mint.key().as_ref(),
    //     ],
    //     bump
    // )]
    /// CHECK: This is used to store the metadata for the token
    pub metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,

    #[account(address = anchor_metaplex::mpl_token_metadata::ID)]
    pub token_meta_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateStablefunCoin<'info> {
    pub fn create(
        &mut self,
        name: String,
        symbol: String,
        icon: String,
        fiat: String,
    ) -> Result<()> {
        let coin = &mut self.stablefun_coin;
        coin.creator = *self.user.key;
        coin.name = name.clone();
        coin.name.truncate(MAX_NAME_LENGTH);
        coin.symbol = symbol.clone();
        coin.symbol.truncate(MAX_SYMBOL_LENGTH);
        coin.icon = icon.clone();
        coin.icon.truncate(MAX_URI_LENGTH);
        coin.fiat = match fiat.as_str() {
            "USD" => SupportedBonds::USTRY,
            "EUR" => SupportedBonds::EUROB,
            "GBP" => SupportedBonds::GILTS,
            "MXN" => SupportedBonds::CETES,
            "BRL" => SupportedBonds::TESOURO,
            _ => return Err(StablefunError::InvalidFiat.into()),
        };
        coin.mint = *self.token_mint.to_account_info().key;
        coin.creator = *self.user.key;

        let creators = vec![
            Creator {
                address: self.user.key(),
                verified: true,
                share: 100,
            },
        ];

        let metadata_data = DataV2 {
            name: fiat.clone() + " " + name.as_str(),
            symbol: symbol.clone(),
            uri: icon.clone(),
            seller_fee_basis_points: 0,
            creators: Some(creators),
            collection: None,
            uses: None,
        };

        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: self.metadata.to_account_info(),
            mint: self.token_mint.to_account_info(),
            mint_authority: self.stablefun_market.to_account_info(),
            payer: self.user.to_account_info(),
            update_authority: self.user.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(),
        };

        // Create the CPI context
        let cpi_ctx = CpiContext::new(
            self.token_meta_program.to_account_info(),
            cpi_accounts,
        );

        // Invoke the metadata creation via anchor-metaplex
        create_metadata_accounts_v3(
            cpi_ctx,
            metadata_data,
            true,
            false,
            None
        )?;

        Ok(())
    }
}
