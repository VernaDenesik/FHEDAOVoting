import { NextRequest, NextResponse } from 'next/server';

/**
 * Homomorphic computation API endpoint
 * Handles computation requests on encrypted data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, operands } = body;

    if (!operation || !operands || !Array.isArray(operands)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: operation and operands array required'
        },
        { status: 400 }
      );
    }

    // Homomorphic computations are performed on-chain
    // This endpoint provides information about available operations
    const supportedOperations = [
      'add', 'sub', 'mul', 'div',
      'and', 'or', 'xor', 'not',
      'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
      'min', 'max', 'neg', 'shl', 'shr'
    ];

    if (!supportedOperations.includes(operation)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported operation. Supported: ${supportedOperations.join(', ')}`
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Homomorphic computations are performed on-chain by smart contracts',
      operation,
      operandsCount: operands.length,
      supportedOperations
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Computation failed'
      },
      { status: 500 }
    );
  }
}
