# Base Sepolia independent validation packet

This packet records the DATCORE public testnet deployment and gives an
independent reviewer enough information to reproduce the read-only checks
without trusting this document's conclusions.

## Deployment identity

| Item | Value |
|---|---|
| Network | Base Sepolia (`84532`) |
| Contract | [`0x2474A062Ec669C1912Ed41Bc491E8a97db4743D4`](https://base-sepolia.blockscout.com/address/0x2474A062Ec669C1912Ed41Bc491E8a97db4743D4?tab=contract) |
| Deployment transaction | [`0xa783…dc55`](https://base-sepolia.blockscout.com/tx/0xa78311374ff4aa6c871f885301c170a33394c90ba494f2c5eebb12279c6ddc55) |
| Deployment block | `46922780` |
| Deployed at | `2026-09-17 02:57:28 UTC` |
| Deployer / initial holder | `0x7883F44CCf5c7a7F609DaB2bbeC039A44E824cde` |
| Contract release commit | [`732cac5`](https://github.com/0628DAO/DAT/commit/732cac5af6c09df6c254b43b0b878b97206af7e6) |
| Deployment tooling commit | [`0c00c38`](https://github.com/0628DAO/DAT/commit/0c00c38317eff6b9e91d888cdca774a5ac831c91) |
| Detailed record | [`deployments/base-sepolia.json`](deployments/base-sepolia.json) |

Blockscout reports the contract source as verified. The compiled runtime
contains constructor-set EIP-712 immutable values, so its raw hash is expected
to differ from the unlinked artifact template. After masking only the compiler
reported immutable reference ranges, the on-chain runtime and the locally
compiled artifact are byte-for-byte identical, with Keccak-256
`0x6567224d1e46c8e80d345970cf59ed9dcd8949ff00cb873884e9a0decf377e64`.

## Live transaction checks

| Check | Result | Transaction |
|---|---|---|
| Direct `transfer` of 1 DAT | Success | [`0x89e0…d5e4`](https://base-sepolia.blockscout.com/tx/0x89e020110f4341da216813aa060e89aef548b9e50879081b1ff2e95bc454d5e4) |
| Holder `burn` of 1 DAT | Success | [`0xe3b6…41ad`](https://base-sepolia.blockscout.com/tx/0xe3b6a8047397a8e4055b1b359dd1e52d04d7bf60dde4d6eae07f72b4876241ad) |
| EIP-2612 `permit` for 2 DAT | Success | [`0x20b0…fd25`](https://base-sepolia.blockscout.com/tx/0x20b0eefee71e9f55bc3c78a859f857e1f1634b1a0dc95d3570f468225e40fd25) |
| Allowance `transferFrom` of 1 DAT | Success | [`0x61ff…2ec3`](https://base-sepolia.blockscout.com/tx/0x61ffa7ffde513617ed6a5bfa6505e5a062bee9a0d5370a88498c1a00248f2ec3) |
| Allowance `burnFrom` of 1 DAT | Success | [`0x3b9e…8dc6`](https://base-sepolia.blockscout.com/tx/0x3b9e9cf272783cf4acfc23bf3f9a325eda17b8e58d55cf94f463d56304388dc6) |
| Replay of consumed permit | Reverted in `eth_call` | No transaction submitted |
| Transfer to zero address | Reverted in `eth_call` | No transaction submitted |

The two transfer paths sent a total of 2 testnet DAT to
`0xfbE494B465efe6d0DAFf80dC715302D0Fa0Ac5d9`. The two burn paths reduced the
testnet supply by 2 DAT. Therefore, the expected current total supply is
`999,999,998 DAT`; the immutable initial-supply constant remains
`1,000,000,000 DAT`.

## Reproduce the checks

Use Node.js 22 or newer. The verifier is read-only, needs no wallet key, and
does not submit a transaction.

```shell
npm ci
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org npm run verify:base-sepolia
```

A successful run prints `"result": "PASS"`. It independently checks the chain
ID, deployment receipt, metadata, constants, balances, current supply, permit
nonce, all five successful transaction receipts, normalized runtime bytecode,
permit replay rejection, and zero-address transfer rejection.

## Review prompt for Grok or Claude

```text
Independently verify the DATCORE Base Sepolia deployment. Do not trust the
README conclusions. Start from chain ID 84532, contract
0x2474A062Ec669C1912Ed41Bc491E8a97db4743D4, deployment transaction
0xa78311374ff4aa6c871f885301c170a33394c90ba494f2c5eebb12279c6ddc55,
and GitHub contract release commit
732cac5af6c09df6c254b43b0b878b97206af7e6. Check the deployment sender,
constructor argument, compiler settings, verified source, runtime bytecode
with compiler-declared immutable ranges normalized, token metadata, immutable
initial supply, current supply, balances, EIP-2612 nonce, and each transaction
listed in deployments/base-sepolia.json. Run npm ci, npm run check, and the
read-only npm run verify:base-sepolia command. Report every mismatch and do not
infer mainnet readiness from testnet success.
```

This is testnet evidence only. It is not an audit, a mainnet approval, or a
claim that testnet DAT has monetary value.
