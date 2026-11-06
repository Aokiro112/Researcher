import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS } from '@/lib/types/models';

export async function GET() {
  return NextResponse.json({
    version: '2.18',
    models: AVAILABLE_MODELS,
    default_model: 'gemini-3.8-flash',
  });
}
