# DATCORE (DAT) — Base Sepolia Public Testnet

**Repository status:** Public testnet release candidate / locally tested / unaudited  
**Test network:** Base Sepolia (chain ID `84532`)  
**Maintainer:** 0628DAO / AssetDeploy LLC

This repository publishes the DATCORE fixed-supply ERC-20 source and a guarded
Base Sepolia deployment path. It is intended for public testnet validation of
the same base-token design used on Base Mainnet. Protocol, agent-service,
settlement, governance, and liquidity-state-transition logic remain separate
from the base token.

## Contract specification

| Item | Value |
|---|---|
| Contract | `DATCore` |
| Token name | DATCORE |
| Symbol | DAT |
| Initial supply | 1,000,000,000 DAT |
| Decimals | 18 |
| Transfer / buy / sell tax | 0% |
| Additional minting | None |
| Burn | Holder burn and allowance-based `burnFrom` |
| Permit | EIP-2612 |
| Owner / admin / pause / upgrade / proxy | None |

The source in [`contracts/DATCore.sol`](contracts/DATCore.sol) matches the
verified DATCORE source published for the live Base Mainnet contract.

## Official Base Mainnet reference

| Item | Official value |
|---|---|
| Network | Base Mainnet (chain ID `8453`) |
| Contract | [`0x6c83dd253F2F882B9884Fd1ac3A7754ED6405de5`](https://base.blockscout.com/address/0x6c83dd253F2F882B9884Fd1ac3A7754ED6405de5?tab=contract) |
| Deployment transaction | [`0x49cb…b589`](https://base.blockscout.com/tx/0x49cb417f0231eb149d60bcc471d0676a0643eb5cfc319741d8452c6e5d9cb589) |
| Deployment record | [`deployments/base-mainnet.json`](deployments/base-mainnet.json) |

Always verify the full network and contract address. A Base Sepolia address is
not the Base Mainnet token address and testnet DAT has no production status.

## Local verification

Requirements: Node.js 22 or newer and npm.

```shell
npm ci
npm run check
```

The test suite covers token metadata, the fixed supply, initial allocation,
zero-address protection, transfers, allowances, `transferFrom`, holder burns,
allowance-based burns, unauthorized-burn rejection, EIP-2612 nonce support,
and the absence of administrator mint, pause, upgrade, owner, and admin entry
points.

## Base Sepolia deployment

1. Copy `.env.example` to `.env` and use a dedicated testnet key.
2. Fund only that testnet address with Base Sepolia ETH.
3. Run:

```shell
npm run deploy:base-sepolia
```

The deployment script refuses any chain other than Base Sepolia (`84532`) and
rejects an invalid or zero initial-holder address. When `INITIAL_HOLDER` is not
set, the deployer receives the complete test supply.

No private key, seed phrase, API secret, or funded production credential should
ever be committed to this repository.

## Patent status

A U.S. provisional patent application concerning separate DAT protocol
research was received by the USPTO as Application No. `64/141,929`, filed
August 26, 2026, under the title *Irreversible-Accumulator-Indexed Liquidity
State Transition Mechanism*. This confirms receipt of a provisional application
only; it is not a patent grant, examination result, approval, or guarantee of
future patent rights.

## Important notices

- DATCORE is unaudited.
- This repository is not an offer to sell tokens, an investment solicitation,
  financial advice, or a promise of profit or price appreciation.
- Testnet deployment and testing do not establish production security.
- Future protocol-layer contracts must be published, tested, reviewed, and
  identified separately.

## Official channels

- Website: [assetdeploy.xyz](https://assetdeploy.xyz)
- DATCORE page: [datcore-official.kurodamasashi1961.chatgpt.site](https://datcore-official.kurodamasashi1961.chatgpt.site)
- GitHub: [0628DAO](https://github.com/0628DAO)
- X: [@CAWmunityJAPAN](https://x.com/CAWmunityJAPAN)
- Contact: [info@assetdeploy.xyz](mailto:info@assetdeploy.xyz)

© 0628DAO / AssetDeploy LLC. Released under the MIT License.

