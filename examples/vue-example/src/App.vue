<template>
  <div class="container">
    <header>
      <h1>FHEVM SDK Demo</h1>
      <p>Vue.js Example with FHEVM SDK Integration</p>
      <button @click="connectWallet" v-if="!connectedAddress" class="connect-button">
        {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
      </button>
      <div v-else class="wallet-connected">
        Connected: {{ connectedAddress.slice(0, 6) }}...{{ connectedAddress.slice(-4) }}
      </div>
    </header>

    <main>
      <div v-if="error" class="error">
        Error: {{ error }}
      </div>

      <div v-if="isInitialized" class="content">
        <div class="card">
          <h2>Encrypt Data</h2>
          <div class="form">
            <input
              v-model="encryptValue"
              type="number"
              placeholder="Enter a number to encrypt"
              class="input"
            />
            <button @click="handleEncrypt" :disabled="loading || !encryptValue" class="button">
              {{ loading ? 'Encrypting...' : 'Encrypt' }}
            </button>
          </div>
          <pre v-if="encryptedResult" class="result">{{ encryptedResult }}</pre>
        </div>

        <div class="card">
          <h2>Decrypt Data</h2>
          <div class="form">
            <input
              v-model="decryptHandle"
              type="text"
              placeholder="Enter handle to decrypt"
              class="input"
            />
            <button @click="handleDecrypt" :disabled="loading || !decryptHandle" class="button">
              {{ loading ? 'Decrypting...' : 'Decrypt' }}
            </button>
          </div>
          <div v-if="decryptedResult" class="result">
            <strong>Decrypted Value:</strong> {{ decryptedResult }}
          </div>
        </div>
      </div>

      <div v-else class="info">
        {{ connectedAddress ? 'Initializing FHEVM...' : 'Please connect your wallet to continue' }}
      </div>
    </main>

    <footer>
      <p>Powered by FHEVM SDK</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x';

const client = ref<FhevmClient | null>(null);
const connectedAddress = ref('');
const isConnecting = ref(false);
const isInitialized = ref(false);
const error = ref<string | null>(null);

const encryptValue = ref('');
const encryptedResult = ref('');
const decryptHandle = ref('');
const decryptedResult = ref('');
const loading = ref(false);

const connectWallet = async () => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    alert('Please install MetaMask');
    return;
  }

  isConnecting.value = true;
  try {
    const provider = new BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    connectedAddress.value = addr;
  } catch (err) {
    console.error('Failed to connect:', err);
    alert('Failed to connect wallet');
  } finally {
    isConnecting.value = false;
  }
};

const initFhevm = async () => {
  try {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const fhevmClient = new FhevmClient({
      provider,
      signer,
      contractAddress: CONTRACT_ADDRESS,
    });

    await fhevmClient.init();
    client.value = fhevmClient;
    isInitialized.value = true;
    error.value = null;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to initialize FHEVM';
    error.value = message;
    console.error('FHEVM initialization error:', err);
  }
};

watch(connectedAddress, (newVal) => {
  if (newVal && !isInitialized.value) {
    initFhevm();
  }
});

const handleEncrypt = async () => {
  if (!client.value) return;

  loading.value = true;
  try {
    const value = parseInt(encryptValue.value);
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const callerAddress = await signer.getAddress();

    const encrypted = await client.value.encrypt({
      contractAddress: CONTRACT_ADDRESS,
      callerAddress,
      value: { amount: value },
    });

    encryptedResult.value = JSON.stringify(
      {
        handles: Array.from(encrypted.handles[0] || []),
        proof: encrypted.inputProof.slice(0, 20) + '...',
      },
      null,
      2
    );
  } catch (err) {
    console.error('Encryption failed:', err);
    alert('Encryption failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
  } finally {
    loading.value = false;
  }
};

const handleDecrypt = async () => {
  if (!client.value) return;

  loading.value = true;
  try {
    const handle = BigInt(decryptHandle.value);
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const result = await client.value.userDecrypt({
      handle,
      contractAddress: CONTRACT_ADDRESS,
      userAddress,
    });

    decryptedResult.value = result.success ? result.value.toString() : 'Decryption failed';
  } catch (err) {
    console.error('Decryption failed:', err);
    alert('Decryption failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
  } finally {
    loading.value = false;
  }
};
</script>
