import {
    AuthorityType,
    createAssociatedTokenAccountInstruction,
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    createMintToCheckedInstruction,
    createSetAuthorityInstruction,
    ExtensionType,
    getAccount,
    getAccountLen,
    getAssociatedTokenAddressSync,
    getMint,
    getMintLen,
    getTokenMetadata,
    LENGTH_SIZE,
    TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    TYPE_SIZE,
} from "@solana/spl-token";
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    pack,
    TokenMetadata,
} from "@solana/spl-token-metadata";
import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction
} from "@solana/web3.js";

import { STABLEFUN_MARKET_ID } from "@/utils/stablefun-utils";

const bondToFiat = {
    "ustry": "USD",
    "gilts": "GBP",
    "eurob": "EUR",
    "cetes": "MXN",
    "tesouro": "BRL",
}

// create a new stablebond token, with the authority set to the stablefun market
export default async function createStablebondToken(
    // payer: Keypair,
    payer: PublicKey,
    connection: Connection,
    name: string,
    symbol: string,
    uri: string,
    bond: keyof typeof bondToFiat
) {
    const mint = Keypair.generate()
    const decimals = 6

    console.log("creating mint with parameters: ")
    console.log(" name: ", name)
    console.log(" symbol: ", symbol)
    console.log(" uri: ", uri)
    console.log(" bond: ", bond)
    console.log(" mint: ", mint.publicKey.toBase58())
    console.log(" connection: ", connection.rpcEndpoint)

    const metadata: TokenMetadata = {
        mint: mint.publicKey,
        name: bondToFiat[bond] + " " + name,
        symbol: "stbl" + symbol,
        uri: uri,
        additionalMetadata: [["Bond", bond] as const]
    }

    const [mintAuthorityPDA, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("stablefun_mint")],
        STABLEFUN_MARKET_ID
    );

    console.log(" mintAuthority: ", mintAuthorityPDA.toBase58())

    const mintLen = getMintLen([ExtensionType.MetadataPointer])
    const metaLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metaLen)

    const createMintAccountInstr = SystemProgram.createAccount({
        fromPubkey: payer,
        lamports,
        newAccountPubkey: mint.publicKey,
        programId: TOKEN_2022_PROGRAM_ID,
        space: mintLen,
    })

    console.log("createMint, \n frompubkey: %s, \n newAccountPubkey: %s, \n programId: %s, \n space: %s",
        payer.toBase58(),
        mint.publicKey.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58(),
        mintLen
    )

    const initMetaPointerInstr = createInitializeMetadataPointerInstruction(
        mint.publicKey,
        payer,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
    )

    console.log("initMetaPointer, \n mint: %s, \n payer: %s, \n metadata: %s, \n programId: %s",
        mint.publicKey.toBase58(),
        payer.toBase58(),
        mint.publicKey.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    const initMintInstr = createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        payer,
        payer,
        TOKEN_2022_PROGRAM_ID,
    )

    console.log("initMint, \n mint: %s, \n decimals: %s, \n mintAuthority: %s, \n freezeAuthority: %s, \n programId: %s",
        mint.publicKey.toBase58(),
        decimals,
        payer.toBase58(),
        payer.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    const initMetaInstr = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer,
        updateAuthority: payer,
    })

    console.log("initMeta, \n programId: %s, \n mint: %s, \n metadata: %s, \n name: %s, \n symbol: %s, \n uri: %s, \n mintAuthority: %s, \n updateAuthority: %s",
        TOKEN_2022_PROGRAM_ID.toBase58(),
        mint.publicKey.toBase58(),
        mint.publicKey.toBase58(),
        metadata.name,
        metadata.symbol,
        metadata.uri,
        payer.toBase58(),
        payer.toBase58()
    )

    const updateMetaInstr = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint.publicKey,
        updateAuthority: payer,
        field: metadata.additionalMetadata[0][0],
        value: metadata.additionalMetadata[0][1],
    })

    console.log("updateMeta, \n programId: %s, \n metadata: %s, \n updateAuthority: %s, \n field: %s, \n value: %s",
        TOKEN_2022_PROGRAM_ID.toBase58(),
        mint.publicKey.toBase58(),
        payer.toBase58(),
        metadata.additionalMetadata[0][0],
        metadata.additionalMetadata[0][1]
    )

    const userAta = getAssociatedTokenAddressSync(
        mint.publicKey,
        payer,
        false,
        TOKEN_2022_PROGRAM_ID,
    )

    const createUserAtaInstr = createAssociatedTokenAccountInstruction(
        payer,
        userAta,
        payer,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
    )

    console.log("createUserAta, \n payer: %s, \n userAta: %s, \n owner: %s, \n mint: %s, \n programId: %s",
        payer.toBase58(),
        userAta.toBase58(),
        payer.toBase58(),
        mint.publicKey.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    const stablefunAta = getAssociatedTokenAddressSync(
        mint.publicKey,
        STABLEFUN_MARKET_ID,
        true,
        TOKEN_2022_PROGRAM_ID,
    )

    const createStablefunAtaInstr = createAssociatedTokenAccountInstruction(
        payer,
        stablefunAta,
        STABLEFUN_MARKET_ID,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
    )

    console.log("createStablefunAta, \n payer: %s, \n stablefunAta: %s, \n owner: %s, \n mint: %s, \n programId: %s",
        payer.toBase58(),
        stablefunAta.toBase58(),
        STABLEFUN_MARKET_ID.toBase58(),
        mint.publicKey.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    // const mintInstr = createMintToCheckedInstruction(
    //     mint.publicKey,
    //     userAta,
    //     payer.publicKey,
    //     0,
    //     decimals,
    //     undefined,
    //     TOKEN_2022_PROGRAM_ID,
    // )

    const mintInstr = createMintToCheckedInstruction(
        mint.publicKey,
        stablefunAta,
        payer,
        100e9,
        decimals,
        undefined,
        TOKEN_2022_PROGRAM_ID,
    )

    console.log("mintInstr, \n mint: %s, \n dest: %s, \n authority: %s, \n amount: %s, \n decimals: %s, \n programId: %s",
        mint.publicKey.toBase58(),
        stablefunAta.toBase58(),
        payer.toBase58(),
        100e9,
        decimals,
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    // update authorities to the stablefun market
    const setMintAuthorityInstr = createSetAuthorityInstruction(
        mint.publicKey,
        payer,
        AuthorityType.MintTokens,
        mintAuthorityPDA,
        undefined,
        TOKEN_2022_PROGRAM_ID
    )

    console.log("setMintAuthority, \n mint: %s, \n authority: %s, \n authorityType: %s, \n newAuthority: %s, \n programId: %s",
        mint.publicKey.toBase58(),
        payer.toBase58(),
        AuthorityType.MintTokens,
        mintAuthorityPDA.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    const setOwnerInstr = createSetAuthorityInstruction(
        mint.publicKey,
        payer,
        AuthorityType.FreezeAccount,
        STABLEFUN_MARKET_ID,
        undefined,
        TOKEN_2022_PROGRAM_ID
    )

    console.log("setOwner, \n mint: %s, \n authority: %s, \n authorityType: %s, \n newAuthority: %s, \n programId: %s",
        mint.publicKey.toBase58(),
        payer.toBase58(),
        AuthorityType.FreezeAccount,
        STABLEFUN_MARKET_ID.toBase58(),
        TOKEN_2022_PROGRAM_ID.toBase58()
    )

    const transaction = new Transaction().add(
        createMintAccountInstr,
        initMetaPointerInstr,
        initMintInstr,
        initMetaInstr,
        updateMetaInstr,
        createUserAtaInstr,
        createStablefunAtaInstr,
        mintInstr,
        setMintAuthorityInstr,
        setOwnerInstr
    )

    // @ts-ignore expexted to be unused
    // const sig = await sendAndConfirmTransaction(
    //     connection,
    //     transaction,
    //     [payer, mint],
    // )

    return { transaction, mint }

    // const accountDetails = await getAccount(
    //     connection,
    //     stablefunAta,
    //     "finalized",
    //     TOKEN_2022_PROGRAM_ID,
    // );
    // console.log("Associate Token Account =====>", accountDetails);

    // // Fetching the mint
    // const mintDetails = await getMint(
    //     connection,
    //     mint.publicKey,
    //     undefined,
    //     TOKEN_2022_PROGRAM_ID,
    // );
    // console.log("Mint =====>", mintDetails);

    // // Since the mint stores the metadata in itself, we can just get it like this
    // const onChainMetadata = await getTokenMetadata(connection, mint.publicKey);
    // // Now we can see the metadata coming with the mint
    // console.log("onchain metadata =====>", onChainMetadata);

    // // And we can even get the offchain JSON now
    // if (onChainMetadata?.uri) {
    //     try {
    //         const response = await fetch(onChainMetadata.uri);
    //         const offChainMetadata = await response.json();
    //         console.log("Mint offchain metadata =====>", offChainMetadata);
    //     } catch (error) {
    //         console.error("Error fetching or parsing offchain metadata:", error);
    //     }
    // }
}

// TODO: remove these
// import fs from "fs";

// function loadKeypairFromFile(filename: string): Keypair {
//     const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
//     const secretKey = Uint8Array.from(secret);
//     return Keypair.fromSecretKey(secretKey);
// }

// await createStablebondToken(
//     loadKeypairFromFile("/Users/neo/.config/solana/id.json"),
//     new Connection("https://api.devnet.solana.com"),
//     "Pepega V1",
//     "PEPE",
//     "https://cdn3.emoji.gg/emojis/9716_Pepega.png",
//     "ustry"
// )
