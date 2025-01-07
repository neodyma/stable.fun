import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import type { Stablefun } from "../../../stablefun/target/types/stablefun";
import idl from "../../../stablefun/target/idl/stablefun.json";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const getProvider = (wallet: any) => {
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
    );
    return provider;
};

// Initialize the program
export const getProgram = () => {
    return new anchor.Program(idl as Stablefun, {
        connection
    })
}
