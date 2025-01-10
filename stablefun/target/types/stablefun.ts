/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stablefun.json`.
 */
export type Stablefun = {
  "address": "STBLENdv2myCCC2aa2ehHukTK9UvK9vxrMbAh4JtWHq",
  "metadata": {
    "name": "stablefun",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Stable.fun"
  },
  "instructions": [
    {
      "name": "createStablecoin",
      "discriminator": [
        100,
        62,
        131,
        196,
        204,
        102,
        67,
        185
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "stablefunMarket",
          "writable": true
        },
        {
          "name": "stablefunCoin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  99,
                  111,
                  105,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mintAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetaProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "icon",
          "type": "string"
        },
        {
          "name": "fiat",
          "type": "string"
        }
      ]
    },
    {
      "name": "depositFiat",
      "discriminator": [
        253,
        29,
        126,
        241,
        137,
        224,
        87,
        227
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userUsdcAccount",
          "writable": true
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "usdcMint",
          "writable": true,
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "tokenMintAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token22Program"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "depositAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "stablefunUsdcAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  117,
                  115,
                  100,
                  99
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "redeemToken",
      "discriminator": [
        190,
        85,
        90,
        176,
        192,
        218,
        41,
        214
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userUsdcAccount",
          "writable": true
        },
        {
          "name": "treasuryUsdcAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  117,
                  115,
                  100,
                  99
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryUsdcAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "usdcMint",
          "writable": true,
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "tokenMintAuth",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  98,
                  108,
                  101,
                  102,
                  117,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token22Program"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "redeemAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stablefunCoin",
      "discriminator": [
        72,
        242,
        108,
        105,
        55,
        55,
        37,
        204
      ]
    },
    {
      "name": "stablefunMarket",
      "discriminator": [
        38,
        12,
        144,
        222,
        172,
        233,
        218,
        35
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unspecError",
      "msg": "Unspecified Error"
    },
    {
      "code": 6001,
      "name": "invalidFiat",
      "msg": "Invalid Fiat"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "Invalid Amount"
    }
  ],
  "types": [
    {
      "name": "stablefunCoin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "icon",
            "type": "string"
          },
          {
            "name": "fiat",
            "type": {
              "defined": {
                "name": "supportedBonds"
              }
            }
          },
          {
            "name": "mint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "stablefunMarket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "tokenCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "supportedBonds",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "ustry"
          },
          {
            "name": "eurob"
          },
          {
            "name": "gilts"
          },
          {
            "name": "cetes"
          },
          {
            "name": "tesouro"
          }
        ]
      }
    }
  ]
};
