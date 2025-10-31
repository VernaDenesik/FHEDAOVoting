import { NextRequest, NextResponse } from 'next/server';

/**
 * Main FHE operations API route
 * Handles general FHE operations and status checks
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'FHE API is running',
    endpoints: {
      encrypt: '/api/fhe/encrypt',
      decrypt: '/api/fhe/decrypt',
      compute: '/api/fhe/compute',
      keys: '/api/keys'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, data } = body;

    return NextResponse.json({
      success: true,
      operation,
      result: data
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
