# DATCORE (DAT) — Base Sepolia Public Testnet

**Repository status:** Public testnet deployed / on-chain tested / unaudited<br>
**Test network:** Base Sepolia (chain ID `84532`)<br>
**Maintainer:** 0628DAO / AssetDeploy LLC (アセットデプロイ合同会社)

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

The source in [`contracts/DATCore.sol`](contracts/DATCore.sol) exactly matches
the DATCORE source verified by Blockscout for the live Base Mainnet contract.
The match was rechecked against Blockscout's published source on September 17,
2026. The verified build uses Solidity `0.8.34`, the compiler-default EVM
version, and no optimizer. The source pragma remains `^0.8.24` because it is
part of that exact verified source.

## Official Base Mainnet reference

| Item | Official value |
|---|---|
| Network | Base Mainnet (chain ID `8453`) |
| Contract | [`0x6c83dd253F2F882B9884Fd1ac3A7754ED6405de5`](https://base.blockscout.com/address/0x6c83dd253F2F882B9884Fd1ac3A7754ED6405de5?tab=contract) |
| Deployment transaction | [`0x49cb…b589`](https://base.blockscout.com/tx/0x49cb417f0231eb149d60bcc471d0676a0643eb5cfc319741d8452c6e5d9cb589) |
| Initial holder / deployer | `0xfbE494B465efe6d0DAFf80dC715302D0Fa0Ac5d9` |
| Deployment block | `51281431` |
| Deployed at | `2026-09-14 02:16:49 UTC` |
| Verification | Blockscout exact match |
| Deployment record | [`deployments/base-mainnet.json`](deployments/base-mainnet.json) |

Always verify the full network and contract address. A Base Sepolia address is
not the Base Mainnet token address and testnet DAT has no production status.

At deployment, the complete fixed supply was minted to the initial-holder
address shown above. The token contract contains no vesting or lock mechanism.
Any later allocation, liquidity, or custody activity occurs outside the base
token contract and must be evaluated from current on-chain records.

## Live Base Sepolia deployment

| Item | Published value |
|---|---|
| Network | Base Sepolia (chain ID `84532`) |
| Contract | [`0x2474A062Ec669C1912Ed41Bc491E8a97db4743D4`](https://base-sepolia.blockscout.com/address/0x2474A062Ec669C1912Ed41Bc491E8a97db4743D4?tab=contract) |
| Deployment transaction | [`0xa783…dc55`](https://base-sepolia.blockscout.com/tx/0xa78311374ff4aa6c871f885301c170a33394c90ba494f2c5eebb12279c6ddc55) |
| Initial holder / deployer | `0x7883F44CCf5c7a7F609DaB2bbeC039A44E824cde` |
| Deployment block | `46922780` |
| Deployed at | `2026-09-17 02:57:28 UTC` |
| Explorer source status | Blockscout verified |
| Contract release | [`732cac5`](https://github.com/0628DAO/DAT/commit/732cac5af6c09df6c254b43b0b878b97206af7e6) |
| Deployment record | [`deployments/base-sepolia.json`](deployments/base-sepolia.json) |
| Independent validation packet | [`BASE_SEPOLIA_VALIDATION.md`](BASE_SEPOLIA_VALIDATION.md) |
| DApp URL | [0628dat.xyz](https://0628dat.xyz) |

Live test transactions exercised direct transfer, holder burn, EIP-2612
permit, allowance transfer, and allowance burn. Permit replay and zero-address
transfer rejection were also checked with non-mutating calls. The functional
tests transferred 2 DAT and burned 2 DAT, so the current testnet supply is
`999,999,998 DAT`; the contract's immutable initial-supply constant remains
`1,000,000,000 DAT`.

## Local verification

Requirements: Node.js 22 or newer and npm.

```shell
npm ci
npm run check
```

The test suite covers token metadata, the fixed supply, initial allocation,
zero-address protection, transfers, allowances, `transferFrom`, holder burns,
allowance-based burns, unauthorized-burn rejection, EIP-2612 signed permits,
expired and replayed permit rejection, EIP-712 domain data, and the absence of
administrator mint, pause, upgrade, owner, and admin entry points.

The live Base Sepolia checks are read-only and require no wallet key:

```shell
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org npm run verify:base-sepolia
```

## Base Sepolia deployment

1. Use a dedicated testnet wallet. Never reuse a production key.
2. Store the RPC URL and private key in Hardhat's encrypted keystore:

```shell
npx hardhat keystore set BASE_SEPOLIA_RPC_URL
npx hardhat keystore set BASE_SEPOLIA_PRIVATE_KEY
```

3. Fund only that testnet address with Base Sepolia ETH.
4. Run:

```shell
npm run deploy:base-sepolia
```

The deployment script refuses any chain other than Base Sepolia (`84532`),
rejects an invalid or zero initial-holder address, and checks the deployed
bytecode, total supply, and initial-holder balance. When `INITIAL_HOLDER` is not
set, the deployer receives the complete test supply. `INITIAL_HOLDER` is a
public address, not a secret; set it in the current shell only when a separate
recipient is required.

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

- DApp: [0628dat.xyz](https://0628dat.xyz)
- Website: [assetdeploy.xyz](https://assetdeploy.xyz)
- DATCORE page: [assetdeploy.xyz/#datcore](https://assetdeploy.xyz/#datcore)
- GitHub: [0628DAO](https://github.com/0628DAO)
- X: [@CAWmunityJAPAN](https://x.com/CAWmunityJAPAN)
- Contact: [info@assetdeploy.xyz](mailto:info@assetdeploy.xyz)

© AssetDeploy LLC (アセットデプロイ合同会社). Released under the MIT License.
