import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ js: ['https://example.com/script1.js', 'https://example.com/script2.js'] });
}
