# Next.js FHEVM Example

This is a Next.js application demonstrating the use of FHEVM SDK.

## Features

- Wallet connection with MetaMask
- Encrypt data using FHEVM
- Decrypt data with user signature
- Clean, modern UI

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your contract address
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Click "Connect Wallet" to connect your MetaMask
2. Enter a number to encrypt
3. Click "Encrypt" to see the encrypted result
4. Enter a handle to decrypt
5. Click "Decrypt" to see the decrypted value

## Integration with FHEVM SDK

This example shows how to integrate FHEVM SDK in a Next.js application:

- Custom React hook (`useFhevm`) for easy SDK usage
- Component-based architecture
- TypeScript support
- Error handling and loading states

See `src/hooks/useFhevm.ts` for the main integration logic.
