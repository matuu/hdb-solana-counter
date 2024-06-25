use anchor_lang::prelude::*;

declare_id!("5UQSxfCQmJkr4XDW4sdPbxktbUS5vGzzCTq9Mm7g7k8");

#[program]
mod counter {
    use super::*;

    pub fn create(ctx: Context<Create>, number: u64) -> Result<()> {
        ctx.accounts.my_counter.number = number;
        ctx.accounts.my_counter.owner = ctx.accounts.authority.key();
        msg!("Creating a new counter starting at {} ", number);
        Ok(())
    }

    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
        msg!("Counter deleted");
        Ok(())
    }

    pub fn decrease(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.my_counter.number -= 1;
        msg!(
            "Counter decrease. New value: {}",
            ctx.accounts.my_counter.number
        );
        Ok(())
    }

    pub fn increase(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.my_counter.number += 1;
        msg!(
            "Counter increase. New value: {}",
            ctx.accounts.my_counter.number
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = authority, space = 8 + 8 + 32)]
    pub my_counter: Account<'info, Counter>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = my_counter.owner == authority.key() @ ErrorCode::NotAuthorized,
        close = authority
    )]
    pub my_counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub my_counter: Account<'info, Counter>,

    #[account(
        mut,
        constraint = my_counter.owner == authority.key() @ ErrorCode::NotAuthorized,
    )]
    pub authority: Signer<'info>,
}

#[account]
pub struct Counter {
    number: u64,   // 8 bytes
    owner: Pubkey, // 32 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized")]
    NotAuthorized,
}