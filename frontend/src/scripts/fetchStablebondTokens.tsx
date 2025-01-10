import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    getTokenMetadata
} from "@solana/spl-token";

import { STABLEFUN_MARKET_ID } from "@/utils/stablefun-utils";

// Main function to fetch stablebond tokens with detailed metadata
export default async function fetchStablebondTokens() {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const response = await connection.getParsedTokenAccountsByOwner(STABLEFUN_MARKET_ID, {
            programId: TOKEN_2022_PROGRAM_ID,
        });

        if (response.value.length === 0) {
            console.log("No tokens exist at this point.");
            return JSON.stringify({ tokens: [] });
        }

        const tokensWithMetadata = await Promise.all(
            response.value.map(async (accountInfo) => {
                const parsedInfo = accountInfo.account.data["parsed"]["info"];
                const mintPubkey = new PublicKey(parsedInfo["mint"]);

                const tokenMeta = await getTokenMetadata(connection, mintPubkey);

                return {
                    pubkey: accountInfo.pubkey.toBase58(),
                    mint: parsedInfo["mint"],
                    owner: parsedInfo["owner"],
                    decimals: parsedInfo["tokenAmount"]["decimals"],
                    amount: parsedInfo["tokenAmount"]["amount"] as number,
                    name: tokenMeta?.name,
                    symbol: tokenMeta?.symbol,
                    uri: tokenMeta?.uri,
                };
            })
        );

        const tokensJson = JSON.stringify({ tokens: tokensWithMetadata }, null, 2);
        return tokensJson;

    } catch (error: any) {
        console.error("Error fetching stablebond tokens:", error);
        return JSON.stringify({ error: error.message });
    }
}
