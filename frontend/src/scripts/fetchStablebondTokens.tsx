// import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
// import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

// const STABLEFUN_MARKET_ID = new PublicKey("STBL1grL2qPy4fzVk7Ko2kY8Cb7EwKRYaGHaAptNdSr");

// export default async function fetchStablebondTokens() {
//     // connection
//     const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

//     const owner = STABLEFUN_MARKET_ID;
//     let response = await connection.getParsedTokenAccountsByOwner(owner, {
//         programId: TOKEN_2022_PROGRAM_ID,
//     });

//     console.log(response)

//     response.value.forEach(accountInfo => {
//         console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
//         console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
//         console.log(
//             `owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`,
//         );
//         console.log(
//             `decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`,
//         );
//         console.log(
//             `amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`,
//         );
//         console.log("====================");
//     });
// }

// await fetchStablebondTokens();

import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    getTokenMetadata
} from "@solana/spl-token";

// Define the Stablefun Market Public Key
const STABLEFUN_MARKET_ID = new PublicKey("STBL1grL2qPy4fzVk7Ko2kY8Cb7EwKRYaGHaAptNdSr");

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
                    amount: parsedInfo["tokenAmount"]["amount"],
                    metadata: tokenMeta
                        ? {
                            name: tokenMeta?.name,
                            symbol: tokenMeta?.symbol,
                            uri: tokenMeta?.uri,
                        }
                        : null, // Handle cases where metadata might not exist
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

let tokens = await fetchStablebondTokens();
console.log(tokens);
