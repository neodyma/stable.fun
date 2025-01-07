import { PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";

import { getProvider, getProgram } from "@/utils/anchor";
import { STABLEFUN_MARKET_ID, STABLEFUN_USDC_ACC, USDC_MINT_ID } from "@/utils/stablefun-utils";

export const depositFiat = async (
    wallet: WalletContextState,
    usdcAmount: number, // Amount in USDC (not smallest units)
    tokenMint: PublicKey, // The mint address of your target token
) => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
    }

    const provider = getProvider(wallet);
    const program = getProgram();

    const usdcAmountInDecimals = usdcAmount * 10 ** 6;

    // Get the user's USDC associated token account
    const userUsdcATA = await getAssociatedTokenAddress(
        USDC_MINT_ID,
        wallet.publicKey
    );

    // Get the user's token account for the minted tokens
    const userTokenATA = await getAssociatedTokenAddress(
        tokenMint,
        wallet.publicKey
    );

    const [mintAuthorityPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_mint")],
        STABLEFUN_MARKET_ID
    );

    console.log("mintAuthorityPDA", mintAuthorityPDA.toBase58());

    var tokenAccount = await provider.connection.getAccountInfo(userTokenATA);
    if (!tokenAccount) {
        console.log("Creating token account...");
        console.log("userTokenATA", userTokenATA.toBase58());
        console.log("tokenMint", tokenMint.toBase58());
        console.log("wallet.publicKey", wallet.publicKey.toBase58());

        // Create the associated token account
        const createATAIx = createAssociatedTokenAccountInstruction(
            wallet.publicKey, // Payer
            userTokenATA,     // ATA to create
            wallet.publicKey, // Owner of the ATA
            tokenMint         // Mint for the ATA
        );

        const blockhash = await provider.connection.getLatestBlockhash();
        const transaction = new Transaction().add(createATAIx);
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = wallet.publicKey;
        console.log(transaction);
        const signedTx = await wallet.signTransaction(transaction);
        const txSignature = await provider.sendAndConfirm(signedTx, []);

        console.log(`Created token account: ${txSignature}`);
    }

    tokenAccount = await provider.connection.getAccountInfo(userTokenATA);
    console.log(tokenAccount);

    const blockhash = await provider.connection.getLatestBlockhash();

    // Prepare the transaction
    const tx = await program.methods
        .depositFiat(new anchor.BN(usdcAmountInDecimals))
        .accountsStrict({
            user: wallet.publicKey,
            userUsdcAccount: userUsdcATA,
            treasuryUsdcAccount: STABLEFUN_USDC_ACC,
            userTokenAccount: userTokenATA,
            mint: tokenMint,
            usdcMint: USDC_MINT_ID,
            mintAuthority: mintAuthorityPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

    tx.recentBlockhash = blockhash.blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign and send the transaction
    const signedTx = await wallet.signTransaction(tx);
    const txSignature = await provider.sendAndConfirm(signedTx, []);

    return txSignature;
};
