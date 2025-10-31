import { NextRequest, NextResponse } from 'next/server';

/**
 * Decryption API endpoint
 * Handles decryption requests for FHE operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, contractAddress, userAddress } = body;

    if (!handle || !contractAddress || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: handle, contractAddress, userAddress'
        },
        { status: 400 }
      );
    }

    // Note: Actual decryption happens on the client side using fhevm-sdk
    // This endpoint can be used for public decryption if needed
    return NextResponse.json({
      success: true,
      message: 'User decryption should be performed on the client side using fhevm-sdk',
      handle,
      contractAddress,
      userAddress
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed'
      },
      { status: 500 }
    );
  }
}
