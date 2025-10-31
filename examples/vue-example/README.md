# Vue.js FHEVM Example

Vue 3 application demonstrating FHEVM SDK integration.

## Features

- Composition API
- Reactive state management
- TypeScript support
- Wallet connection
- Encrypt/decrypt functionality

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
# Create .env file
VITE_CONTRACT_ADDRESS=0x...
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:5173

## Integration

This example shows how to use FHEVM SDK in Vue 3:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { FhevmClient } from 'fhevm-sdk';

const client = ref(null);

onMounted(async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  client.value = new FhevmClient({
    provider,
    signer,
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS
  });

  await client.value.init();
});
</script>
```

## Structure

- `src/App.vue` - Main application component
- `src/main.ts` - Application entry point
- `src/style.css` - Global styles
- `vite.config.ts` - Vite configuration

## Usage

1. Connect wallet
2. Enter value to encrypt
3. Click "Encrypt" to see encrypted data
4. Enter handle to decrypt
5. Click "Decrypt" to see decrypted value
