import * as anchor from "@coral-xyz/anchor"
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { PublicKey, sendAndConfirmRawTransaction, sendAndConfirmTransaction, SendTransactionError, Transaction } from "@solana/web3.js"

import { getProgram, getProvider } from "@/utils/anchor"
import { STABLEFUN_MARKET_ID, STABLEFUN_USDC_ACC, USDC_MINT_ID } from "@/utils/stablefun-utils"

export const depositFiat = async (
    wallet: WalletContextState,
    usdcAmount: number,
    tokenMint: PublicKey,
) => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected")
    }

    const provider = getProvider(wallet)
    const program = getProgram()

    const usdcAmountInDecimals = usdcAmount * 10 ** 6

    const userUsdcATA = await getAssociatedTokenAddress(
        USDC_MINT_ID,
        wallet.publicKey
    )

    let [usdcAuthority, usdcAuthBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_usdc")],
        STABLEFUN_MARKET_ID
    )

    const userUsdcEscrow = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_escrow"), wallet.publicKey.toBuffer()],
        STABLEFUN_MARKET_ID
    )[0]

    const userUsdcEscrowAta = await getAssociatedTokenAddress(USDC_MINT_ID, userUsdcEscrow, true, TOKEN_PROGRAM_ID)

    const userTokenATA = await getAssociatedTokenAddress(
        tokenMint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
    )

    console.log("mint", tokenMint.toBase58())
    console.log("userUsdcATA", userUsdcATA.toBase58())
    console.log("userTokenATA", userTokenATA.toBase58())

    const [mintAuthorityPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_mint")],
        STABLEFUN_MARKET_ID
    )

    // const [userEscrow, userEscrowBump] = PublicKey.findProgramAddressSync(
    //     [Buffer.from("stablefun_escrow"), wallet.publicKey.toBuffer()],
    //     STABLEFUN_MARKET_ID
    // )

    // const userEscrowAta = await getAssociatedTokenAddress(
    //     tokenMint,
    //     userEscrow,
    //     true,
    // )

    // console.log("userEscrow", userEscrow.toBase58())
    // console.log("userEscrowAta", userEscrowAta.toBase58())

    // const initTxn = await program.methods.initialize()
    //     .accountsStrict({
    //         systemProgram: anchor.web3.SystemProgram.programId,
    //         user: wallet.publicKey,
    //         stablefunUsdcAuthority: usdcAuthority,
    //     })
    //     .transaction()

    // const usdcblockhash = await provider.connection.getLatestBlockhash()
    // initTxn.recentBlockhash = usdcblockhash.blockhash
    // initTxn.feePayer = wallet.publicKey

    // const initSignedTxn = await wallet.signTransaction(initTxn)
    // await sendAndConfirmRawTransaction(provider.connection, initSignedTxn.serialize())

    console.log("mintAuthorityPDA", mintAuthorityPDA.toBase58())

    var tokenAccount = await provider.connection.getAccountInfo(userTokenATA)
    if (!tokenAccount) {
        console.log("Creating token account...")
        console.log("connection", provider.connection.rpcEndpoint)
        console.log("userTokenATA", userTokenATA.toBase58())
        console.log("tokenMint", tokenMint.toBase58())
        console.log("wallet.publicKey", wallet.publicKey.toBase58())

        let txn = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                userTokenATA,
                wallet.publicKey,
                tokenMint,
                TOKEN_2022_PROGRAM_ID
            )
        )

        const blockhash = await provider.connection.getLatestBlockhash()
        txn.recentBlockhash = blockhash.blockhash
        txn.feePayer = wallet.publicKey
        const signed = await wallet.signTransaction(txn)

        try {
            const sig = sendAndConfirmTransaction(provider.connection, signed, [])
            console.log(`Created token account: ${await sig}`)
        }
        catch (e) {
            console.log("error:", await (e as SendTransactionError).getLogs(provider.connection))
        }
    }

    tokenAccount = await provider.connection.getAccountInfo(userTokenATA)
    console.log(tokenAccount?.owner.toBase58())

    const blockhash = await provider.connection.getLatestBlockhash()

    const txn = await program.methods
        .depositFiat(new anchor.BN(usdcAmountInDecimals))
        .accountsStrict({
            user: wallet.publicKey,
            userUsdcAccount: userUsdcATA,
            treasuryUsdcAccount: STABLEFUN_USDC_ACC,
            // userUsdcEscrow: userEscrow,
            // userUsdcEscrowAta: userEscrowAta,
            // treasuryUsdcAuth: usdcAuthority,
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
        // txnSignature = await sendAndConfirmTransaction(provider.connection, signedTxn, [])
        txnSignature = await sendAndConfirmRawTransaction(provider.connection, signedTxn.serialize())
    } catch (error) {
        console.log(`Error sending transaction: ${error}`)
    }

    return txnSignature
}
