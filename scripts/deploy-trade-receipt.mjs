#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import solc from "solc";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_NAME = "TradeReceipt";
const SOURCE_PATH = path.resolve(__dirname, "../contracts/TradeReceipt.sol");

async function compileContract() {
  const source = await fs.readFile(SOURCE_PATH, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "TradeReceipt.sol": { content: source },
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = output.contracts?.["TradeReceipt.sol"]?.[CONTRACT_NAME];

  if (!contract?.abi || !contract?.evm?.bytecode?.object) {
    throw new Error("Failed to compile TradeReceipt contract");
  }

  return {
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}`,
  };
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY environment variable");
  }

  const rpcUrl = process.env.BASE_RPC_URL ?? base.rpcUrls.public.http[0];

  const account = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);
  const walletClient = createWalletClient({ account, chain: base, transport: http(rpcUrl) });
  const publicClient = createPublicClient({ chain: base, transport: http(rpcUrl) });

  const { abi, bytecode } = await compileContract();

  console.log(`Deploying ${CONTRACT_NAME} to Base using ${account.address}...`);

  const hash = await walletClient.deployContract({ abi, bytecode, account });
  console.log(`Transaction hash: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) {
    throw new Error("Deployment transaction mined but contract address missing");
  }

  const eventTopic = keccak256(stringToHex("TradeNotarized(address,bytes32,bytes32,string,uint256)"));

  const deploymentInfo = {
    address: receipt.contractAddress,
    transactionHash: hash,
    eventSignature: "TradeNotarized(address,bytes32,bytes32,string,uint256)",
    eventTopic,
    deployedAt: Date.now(),
  };

  const outputPath = path.resolve(__dirname, "../contracts/deployments/base-trade-receipt.json");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(deploymentInfo, null, 2)}\n`);

  console.log(`TradeReceipt deployed at ${receipt.contractAddress}`);
  console.log(`Deployment info written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
