# Stable.fun

This repo contains the source code for both frontend and smart contracts for the stable.fun platform.

## Get started

To set up the testing frontend, run the following commands:

```bash
cd frontend
npm run dev
```

and open the hosted website on a browser.

The smart contract is deployed to the address `STBLENdv2myCCC2aa2ehHukTK9UvK9vxrMbAh4JtWHq`, after redeploying the hardcoded public keys have to be updated accordingly (both in the contract source code and `frontend/utils/stablefun-utils.tsx`).

## Using the platform

After connecting the wallet (Phantom preferred), users can create tokens and view the available tokens.
It is possible to buy tokens in exchange for (devnet) USDC, and to redeem tokens for the underlying value in USDC again.

## Troubleshooting

### Cargo.lock file version

If this problem occurs when running `anchor build`, manually change the version in `Cargo.lock` from 4 to 3.
