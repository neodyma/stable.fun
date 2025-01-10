import * as anchor from "@coral-xyz/anchor"
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SendTransactionError, Transaction } from "@solana/web3.js"

import { getProgram, getProvider } from '@/utils/anchor'
import { STABLEFUN_MARKET_ID, STABLEFUN_USDC_ACC, USDC_MINT_ID } from '@/utils/stablefun-utils'

export const redeemToken = async (
    wallet: WalletContextState,
    tokenAmount: number,
    tokenMint: PublicKey,
) => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected")
    }

    console.log("Redeeming token...")

    const provider = getProvider(wallet)
    const program = getProgram()

    const tokenAmountInDecimals = tokenAmount * 10 ** 6

    const userUsdcATA = await getAssociatedTokenAddress(
        USDC_MINT_ID,
        wallet.publicKey
    )

    const [usdcAuthority, usdcAuthBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_usdc")],
        STABLEFUN_MARKET_ID
    )

    const userTokenATA = await getAssociatedTokenAddress(
        tokenMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
    )

    const [userEscrow, userEscrowBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_escrow"), wallet.publicKey.toBuffer()],
        STABLEFUN_MARKET_ID
    )

    const userEscrowAta = await getAssociatedTokenAddress(
        tokenMint,
        userEscrow,
        true,
    )

    const [mintAuthorityPDA, mintAuthBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_mint")],
        STABLEFUN_MARKET_ID
    )

    var tokenAccount = await provider.connection.getAccountInfo(userTokenATA)
    if (!tokenAccount) {
        console.log("Token not found in user wallet.")
    }

    console.log("setting up txn...")

    const blockhash = await provider.connection.getLatestBlockhash()
    
    const txn = await program.methods
        .redeemToken(new anchor.BN(tokenAmountInDecimals))
        .accountsStrict({
            user: wallet.publicKey,
            userUsdcAccount: userUsdcATA,
            treasuryUsdcAuth: usdcAuthority,
            // userUsdcEscrow: userEscrow,
            // userUsdcEscrowAta: userEscrowAta,
            treasuryUsdcAccount: STABLEFUN_USDC_ACC,
            userTokenAccount: userTokenATA,
            tokenMint: tokenMint,
            usdcMint: USDC_MINT_ID,
            tokenMintAuth: mintAuthorityPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            token22Program: TOKEN_2022_PROGRAM_ID,
        })
        .transaction()

    txn.recentBlockhash = blockhash.blockhash
    txn.feePayer = wallet.publicKey

    const signedTxn = await wallet.signTransaction(txn)
    let txnSignature = null

    try {
        // txnSignature = await provider.sendAndConfirm(signedTxn, [])
        txnSignature = await sendAndConfirmRawTransaction(provider.connection, signedTxn.serialize())
    } catch (error) {
        console.log(`Error sending transaction: ${error}`)
    }

    return txnSignature
}
