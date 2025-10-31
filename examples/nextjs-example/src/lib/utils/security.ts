/**
 * Security utilities for the application
 */

export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"']/g, '');
}

export function validateNumber(value: string): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

export function validateBigInt(value: string): boolean {
  try {
    BigInt(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return data;
  }
  return `${data.slice(0, visibleChars)}...${data.slice(-visibleChars)}`;
}
