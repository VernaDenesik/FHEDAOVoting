# API Reference

Complete API documentation for FHEVM SDK.

## FhevmClient

Main client class for FHEVM operations.

### Constructor

```typescript
new FhevmClient(config: FhevmConfig)
```

**Parameters:**
- `config.provider` - Ethers provider instance
- `config.signer` - Ethers signer instance (optional, required for user decryption)
- `config.contractAddress` - Contract address
- `config.chainId` - Chain ID (optional, will be detected)

**Example:**
```typescript
const client = new FhevmClient({
  provider: ethersProvider,
  signer: ethersSigner,
  contractAddress: '0x...'
});
```

### Methods

#### init()

Initialize the FHEVM client.

```typescript
await client.init(): Promise<void>
```

**Example:**
```typescript
await client.init();
```

#### encrypt()

Encrypt data for contract calls.

```typescript
await client.encrypt(params: {
  contractAddress: string;
  callerAddress: string;
  value: any;
}): Promise<EncryptedInput>
```

**Parameters:**
- `contractAddress` - Target contract address
- `callerAddress` - Caller's address
- `value` - Value to encrypt (can be object, number, boolean, or bigint)

**Returns:**
- `EncryptedInput` object with `handles` and `inputProof`

**Example:**
```typescript
const encrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: '0x...',
  value: { amount: 100, isActive: true }
});
```

#### userDecrypt()

Decrypt data using user's signature (EIP-712).

```typescript
await client.userDecrypt(params: {
  handle: bigint;
  contractAddress: string;
  userAddress: string;
}): Promise<DecryptionResult>
```

**Parameters:**
- `handle` - Handle to decrypt
- `contractAddress` - Contract address
- `userAddress` - User's address

**Returns:**
- `DecryptionResult` with `value` and `success` flag

**Example:**
```typescript
const result = await client.userDecrypt({
  handle: 123n,
  contractAddress: '0x...',
  userAddress: '0x...'
});

console.log(result.value); // Decrypted value
```

#### publicDecrypt()

Public decryption (no signature required).

```typescript
await client.publicDecrypt(params: {
  handle: bigint;
  contractAddress: string;
}): Promise<DecryptionResult>
```

**Parameters:**
- `handle` - Handle to decrypt
- `contractAddress` - Contract address

**Returns:**
- `DecryptionResult` with `value` and `success` flag

**Example:**
```typescript
const result = await client.publicDecrypt({
  handle: 456n,
  contractAddress: '0x...'
});
```

#### getPublicKey()

Get contract's public key.

```typescript
await client.getPublicKey(contractAddress: string): Promise<string>
```

**Parameters:**
- `contractAddress` - Contract address

**Returns:**
- Public key as hex string

**Example:**
```typescript
const publicKey = await client.getPublicKey('0x...');
```

## Utility Functions

### initFhevm()

Initialize FHEVM instance.

```typescript
import { initFhevm } from 'fhevm-sdk';

await initFhevm(config: FhevmConfig): Promise<FhevmInstance>
```

**Example:**
```typescript
const instance = await initFhevm({
  provider: ethersProvider,
  contractAddress: '0x...'
});
```

### encryptInput()

Encrypt input data.

```typescript
import { encryptInput } from 'fhevm-sdk';

await encryptInput(
  instance: FhevmInstance,
  params: EncryptionParams
): Promise<EncryptedInput>
```

**Example:**
```typescript
const encrypted = await encryptInput(instance, {
  contractAddress: '0x...',
  callerAddress: '0x...',
  value: { amount: 100 }
});
```

### Typed Encryption Functions

Encrypt specific data types:

```typescript
import {
  encryptBool,
  encryptUint8,
  encryptUint16,
  encryptUint32,
  encryptUint64
} from 'fhevm-sdk';

// Boolean
await encryptBool(instance, contractAddress, callerAddress, true);

// Uint8 (0-255)
await encryptUint8(instance, contractAddress, callerAddress, 42);

// Uint16 (0-65535)
await encryptUint16(instance, contractAddress, callerAddress, 1000);

// Uint32
await encryptUint32(instance, contractAddress, callerAddress, 100000);

// Uint64
await encryptUint64(instance, contractAddress, callerAddress, 1000000n);
```

### userDecrypt()

User decryption utility.

```typescript
import { userDecrypt } from 'fhevm-sdk';

await userDecrypt(
  instance: FhevmInstance,
  params: {
    handle: bigint;
    contractAddress: string;
    userAddress: string;
    signature: string;
  }
): Promise<DecryptionResult>
```

### publicDecrypt()

Public decryption utility.

```typescript
import { publicDecrypt } from 'fhevm-sdk';

await publicDecrypt(
  instance: FhevmInstance,
  params: {
    handle: bigint;
    contractAddress: string;
  }
): Promise<DecryptionResult>
```

### generateEIP712Signature()

Generate EIP-712 signature for reencryption.

```typescript
import { generateEIP712Signature } from 'fhevm-sdk';

await generateEIP712Signature(
  signer: Signer,
  contractAddress: string,
  userAddress: string,
  chainId: number
): Promise<string>
```

**Example:**
```typescript
const signature = await generateEIP712Signature(
  signer,
  '0x...',
  '0x...',
  31337
);
```

## Type Definitions

### FhevmConfig

```typescript
interface FhevmConfig {
  provider: Provider;
  signer?: Signer;
  contractAddress: string;
  chainId?: number;
  publicKey?: string;
}
```

### EncryptedInput

```typescript
interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: string;
}
```

### DecryptionResult

```typescript
interface DecryptionResult {
  value: bigint | boolean | number;
  success: boolean;
}
```

### EncryptionParams

```typescript
interface EncryptionParams {
  contractAddress: string;
  callerAddress: string;
  value?: any;
}
```

## Error Handling

All SDK methods can throw errors. Always wrap calls in try-catch:

```typescript
try {
  const encrypted = await client.encrypt({
    contractAddress: '0x...',
    callerAddress: '0x...',
    value: 100
  });
} catch (error) {
  console.error('Encryption failed:', error);
}
```

## Best Practices

1. **Always initialize before use:**
```typescript
await client.init();
```

2. **Check success flag on decryption:**
```typescript
const result = await client.userDecrypt(...);
if (result.success) {
  console.log('Decrypted:', result.value);
}
```

3. **Handle errors gracefully:**
```typescript
try {
  // SDK operations
} catch (error) {
  // Handle error
}
```

4. **Reuse client instance:**
```typescript
// Create once
const client = new FhevmClient({...});
await client.init();

// Reuse multiple times
const encrypted1 = await client.encrypt({...});
const encrypted2 = await client.encrypt({...});
```
