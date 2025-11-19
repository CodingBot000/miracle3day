import { NextResponse } from 'next/server';
import { YouCamAuth } from '@/app/api/ai/youcam/lib/auth';

export async function GET() {
  try {
    const auth = YouCamAuth.getInstance();
    const token = await auth.getAccessToken();
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      tokenPreview: token.substring(0, 20) + '...',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }, { status: 500 });
  }
}