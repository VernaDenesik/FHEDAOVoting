import { NextRequest, NextResponse } from 'next/server';

/**
 * Encryption API endpoint
 * Handles encryption requests for FHE operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, type = 'uint32' } = body;

    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: 'Value is required' },
        { status: 400 }
      );
    }

    // Note: Actual encryption happens on the client side using fhevm-sdk
    // This endpoint can be used for server-side encryption if needed
    return NextResponse.json({
      success: true,
      message: 'Encryption should be performed on the client side using fhevm-sdk',
      value,
      type
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed'
      },
      { status: 500 }
    );
  }
}
