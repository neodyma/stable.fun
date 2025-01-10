use anchor_lang::prelude::*;

#[error_code]
pub enum StablefunError {
    #[msg("Unspecified Error")]
    UnspecError,
    #[msg("Invalid Fiat")]
    InvalidFiat,
    #[msg("Invalid Amount")]
    InvalidAmount,
}
