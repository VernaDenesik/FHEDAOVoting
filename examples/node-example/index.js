/**
 * Node.js example using FHEVM SDK
 *
 * This demonstrates how to use FHEVM SDK in a Node.js environment
 */

import { FhevmClient } from 'fhevm-sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x';

async function main() {
  console.log('🚀 FHEVM SDK Node.js Example\n');

  // Setup provider and signer
  console.log('1. Connecting to network...');
  const provider = new JsonRpcProvider(RPC_URL);
  const signer = new Wallet(PRIVATE_KEY, provider);
  const address = await signer.getAddress();
  console.log(`   Connected: ${address}\n`);

  // Initialize FHEVM client
  console.log('2. Initializing FHEVM client...');
  const client = new FhevmClient({
    provider,
    signer,
    contractAddress: CONTRACT_ADDRESS,
  });

  await client.init();
  console.log('   FHEVM client initialized\n');

  // Example 1: Encrypt a number
  console.log('3. Encrypting data...');
  const valueToEncrypt = 42;
  const encrypted = await client.encrypt({
    contractAddress: CONTRACT_ADDRESS,
    callerAddress: address,
    value: { amount: valueToEncrypt },
  });

  console.log(`   Original value: ${valueToEncrypt}`);
  console.log(`   Encrypted handles: ${encrypted.handles.length} handle(s)`);
  console.log(`   Input proof length: ${encrypted.inputProof.length} bytes\n`);

  // Example 2: Get public key
  console.log('4. Getting contract public key...');
  try {
    const publicKey = await client.getPublicKey(CONTRACT_ADDRESS);
    console.log(`   Public key: ${publicKey.slice(0, 20)}...\n`);
  } catch (err) {
    console.log(`   Note: Public key retrieval requires deployed contract\n`);
  }

  // Example 3: Demonstrate encryption of different types
  console.log('5. Encrypting different data types...');

  const boolValue = true;
  const encryptedBool = await client.encrypt({
    contractAddress: CONTRACT_ADDRESS,
    callerAddress: address,
    value: boolValue,
  });
  console.log(`   Boolean (${boolValue}) encrypted`);

  const smallNumber = 123;
  const encryptedSmall = await client.encrypt({
    contractAddress: CONTRACT_ADDRESS,
    callerAddress: address,
    value: smallNumber,
  });
  console.log(`   Number (${smallNumber}) encrypted`);

  const largeNumber = 1000000n;
  const encryptedLarge = await client.encrypt({
    contractAddress: CONTRACT_ADDRESS,
    callerAddress: address,
    value: largeNumber,
  });
  console.log(`   BigInt (${largeNumber}) encrypted\n`);

  console.log('✅ Examples completed successfully!');
  console.log('\nNext steps:');
  console.log('  - Deploy a contract to use decryption features');
  console.log('  - Use encrypted data in contract calls');
  console.log('  - Implement user decryption with signatures');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
