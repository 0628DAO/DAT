import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createPublicClient,
  decodeFunctionData,
  getAddress,
  http,
  keccak256,
} from "viem";
import { baseSepolia } from "viem/chains";

const rpcUrl =
  process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
const deployment = JSON.parse(
  readFileSync(new URL("../deployments/base-sepolia.json", import.meta.url)),
);
const artifact = JSON.parse(
  readFileSync(
    new URL(
      "../artifacts/contracts/DATCore.sol/DATCore.json",
      import.meta.url,
    ),
  ),
);

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl, { timeout: 30_000 }),
});
const contractAddress = getAddress(deployment.contractAddress);
const deployer = getAddress(deployment.deployer);
const recipient = getAddress(deployment.postDeploymentValidation.recipient);

function normalizeImmutables(bytecode) {
  const hexCharacters = bytecode.slice(2).split("");

  for (const references of Object.values(artifact.immutableReferences)) {
    for (const { start, length } of references) {
      hexCharacters.splice(
        start * 2,
        length * 2,
        ...Array(length * 2).fill("0"),
      );
    }
  }

  return `0x${hexCharacters.join("")}`;
}

const [
  chainId,
  runtimeBytecode,
  deploymentTransaction,
  deploymentReceipt,
  name,
  symbol,
  decimals,
  initialSupplyUnits,
  initialSupply,
  totalSupply,
  deployerBalance,
  recipientBalance,
  permitNonce,
  remainingAllowance,
] = await Promise.all([
  client.getChainId(),
  client.getBytecode({ address: contractAddress }),
  client.getTransaction({ hash: deployment.deploymentTransaction }),
  client.getTransactionReceipt({ hash: deployment.deploymentTransaction }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "name",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "symbol",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "decimals",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "INITIAL_SUPPLY_UNITS",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "INITIAL_SUPPLY",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "totalSupply",
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "balanceOf",
    args: [deployer],
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "balanceOf",
    args: [recipient],
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "nonces",
    args: [deployer],
  }),
  client.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "allowance",
    args: [deployer, deployer],
  }),
]);

assert.equal(chainId, deployment.chainId);
assert.ok(runtimeBytecode && runtimeBytecode !== "0x");
assert.equal(name, deployment.tokenName);
assert.equal(symbol, deployment.symbol);
assert.equal(decimals, deployment.decimals);
assert.equal(initialSupplyUnits, 1_000_000_000n);
assert.equal(initialSupply.toString(), deployment.initialSupply);
assert.equal(
  totalSupply.toString(),
  deployment.postDeploymentValidation.finalState.totalSupply,
);
assert.equal(
  deployerBalance.toString(),
  deployment.postDeploymentValidation.finalState.deployerBalance,
);
assert.equal(
  recipientBalance.toString(),
  deployment.postDeploymentValidation.finalState.recipientBalance,
);
assert.equal(
  permitNonce.toString(),
  deployment.postDeploymentValidation.finalState.deployerPermitNonce,
);
assert.equal(
  remainingAllowance.toString(),
  deployment.postDeploymentValidation.finalState.remainingSelfAllowance,
);

assert.equal(getAddress(deploymentTransaction.from), deployer);
assert.equal(deploymentTransaction.to, null);
assert.equal(deploymentReceipt.status, "success");
assert.equal(getAddress(deploymentReceipt.contractAddress), contractAddress);
assert.equal(
  deploymentReceipt.blockNumber.toString(),
  deployment.deploymentBlock.toString(),
);

assert.equal(
  keccak256(runtimeBytecode),
  deployment.runtimeBytecodeKeccak256,
);
const normalizedRuntimeBytecode = normalizeImmutables(runtimeBytecode);
const normalizedArtifactBytecode = normalizeImmutables(
  artifact.deployedBytecode,
);
assert.equal(normalizedRuntimeBytecode, normalizedArtifactBytecode);
assert.equal(
  keccak256(normalizedRuntimeBytecode),
  deployment.immutableNormalizedRuntimeBytecodeKeccak256,
);

const validationReceipts = {};
for (const [testName, hash] of Object.entries(
  deployment.postDeploymentValidation.transactions,
)) {
  const receipt = await client.getTransactionReceipt({ hash });
  assert.equal(receipt.status, "success", `${testName} transaction failed`);
  validationReceipts[testName] = {
    hash,
    blockNumber: receipt.blockNumber.toString(),
    status: receipt.status,
  };
}

const permitHash = deployment.postDeploymentValidation.transactions.permit;
const permitTransaction = await client.getTransaction({ hash: permitHash });
const decodedPermit = decodeFunctionData({
  abi: artifact.abi,
  data: permitTransaction.input,
});
assert.equal(decodedPermit.functionName, "permit");

let replayedPermitRejected = false;
try {
  await client.simulateContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "permit",
    args: decodedPermit.args,
    account: deployer,
  });
} catch {
  replayedPermitRejected = true;
}
assert.ok(replayedPermitRejected, "replayed permit was not rejected");

let zeroAddressTransferRejected = false;
try {
  await client.simulateContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "transfer",
    args: ["0x0000000000000000000000000000000000000000", 1n],
    account: deployer,
  });
} catch {
  zeroAddressTransferRejected = true;
}
assert.ok(zeroAddressTransferRejected, "zero-address transfer was not rejected");

console.log(
  JSON.stringify(
    {
      result: "PASS",
      network: deployment.network,
      chainId,
      contractAddress,
      deploymentTransaction: deployment.deploymentTransaction,
      metadata: { name, symbol, decimals },
      immutableNormalizedRuntimeBytecodeMatchesArtifact: true,
      currentState: {
        totalSupply: totalSupply.toString(),
        deployerBalance: deployerBalance.toString(),
        recipientBalance: recipientBalance.toString(),
        permitNonce: permitNonce.toString(),
        remainingAllowance: remainingAllowance.toString(),
      },
      validationTransactions: validationReceipts,
      negativePaths: {
        replayedPermitRejected,
        zeroAddressTransferRejected,
      },
    },
    null,
    2,
  ),
);
