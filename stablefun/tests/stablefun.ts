import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Stablefun } from "../target/types/stablefun";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";
import { TOKEN_PROGRAM_ID, MintLayout, getMinimumBalanceForRentExemptMint, getMint } from "@solana/spl-token";

describe("stablefun", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Stablefun as Program<Stablefun>;

  const user = anchor.AnchorProvider.env().wallet;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Creates a Stablecoin", async () => {
    const name = "Pepega";
    const symbol = "PEPE";
    const icon = "https://cdn3.emoji.gg/emojis/9716_Pepega.png";
    const fiat = "USD";

    // Derive the PDA for the StablefunCoin account
    const [stablefunCoinPda, stablefunCoinBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stablefun_coin"), user.publicKey.toBuffer()],
      program.programId
    );

    const [stablefunMarketPda, stablefunMarketBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stablefun")],
      program.programId
    );

    // Derive the PDA for the token mint
    const [mintPda, mintBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stablefun_mint"), user.publicKey.toBuffer()],
      program.programId
    );

    // Derive the PDA for the metadata account (using Metaplex's PDA derivation)
    const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Metaplex Token Metadata Program ID
    const [metadataPda, metadataBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPda.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // Invoke the create_stablecoin method
    const tx = await program.methods
      .createStablecoin(name, symbol, icon, fiat)
      .accountsStrict({
        systemProgram: SystemProgram.programId,
        stablefunMarket: stablefunMarketPda, // Replace with actual StablefunMarket PDA if different
        stablefunCoin: stablefunCoinPda,
        user: user.publicKey,
        tokenMint: mintPda,
        metadata: metadataPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetaProgram: METADATA_PROGRAM_ID,
        // metadata: metadataPda,
        // updateAuthority: user.publicKey, // Replace with actual update authority if different
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc().catch((err) => {
        err.getLogs()
      });

    console.log("CreateStablecoin transaction signature:", tx);

    // Fetch and verify the StablefunCoin account
    const stablefunCoinAccount = await program.account.stablefunCoin.fetch(stablefunCoinPda);
    assert.equal(stablefunCoinAccount.creator.toString(), user.publicKey.toString(), "Creator should match");
    assert.equal(stablefunCoinAccount.name, name, "Name should match");
    assert.equal(stablefunCoinAccount.symbol, symbol, "Symbol should match");
    assert.equal(stablefunCoinAccount.icon, icon, "Icon URI should match");
    assert.equal(stablefunCoinAccount.fiat, {ustry: {}}, "Fiat should match");
    assert.equal(stablefunCoinAccount.mint.toString(), mintPda.toString(), "Mint PDA should match");

    // Fetch and verify the Mint account
    const mintAccount = await getMint(provider.connection, mintPda);
    assert.equal(mintAccount.decimals, 9, "Mint decimals should be 9");
    assert.equal(mintAccount.mintAuthority?.toString(), user.publicKey.toString(), "Mint authority should match");
    assert.equal(mintAccount.freezeAuthority?.toString(), user.publicKey.toString(), "Freeze authority should match");

    // (Optional) Fetch and verify the Metadata account
    // This requires additional logic to parse Metaplex metadata, which can be done using the @metaplex-foundation/mpl-token-metadata library
  });

});
