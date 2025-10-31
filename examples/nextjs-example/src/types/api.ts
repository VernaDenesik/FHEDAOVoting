/**
 * API type definitions
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptAPIRequest {
  value: any;
  type?: string;
}

export interface DecryptAPIRequest {
  handle: string;
  contractAddress: string;
  userAddress: string;
}

export interface ComputeAPIRequest {
  operation: string;
  operands: any[];
}
