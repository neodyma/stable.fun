use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DepositAcc {
    pub user: Pubkey,
    pub usdc_deposit: u64,
    pub token_amt: u64,
    pub timestamp: i64,
}

impl DepositAcc {
    /// Initializes a new DepositAccount
    pub fn initialize(
        &mut self,
        user: Pubkey,
        usdc_amount: u64,
        token_amount: u64,
        timestamp: i64,
    ) {
        self.user = user;
        self.usdc_deposit = usdc_amount;
        self.token_amt = token_amount;
        self.timestamp = timestamp;
    }
}
