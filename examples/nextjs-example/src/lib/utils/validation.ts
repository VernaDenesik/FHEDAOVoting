/**
 * Validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEncryptionInput(value: any): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: 'Value cannot be null or undefined' };
  }

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return { isValid: false, error: 'Value object cannot be empty' };
  }

  return { isValid: true };
}

export function validateDecryptionHandle(handle: string): ValidationResult {
  if (!handle || handle.trim() === '') {
    return { isValid: false, error: 'Handle cannot be empty' };
  }

  try {
    BigInt(handle);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Handle must be a valid number' };
  }
}

export function validateContractAddress(address: string): ValidationResult {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address cannot be empty' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  return { isValid: true };
}
