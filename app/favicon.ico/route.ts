import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Return 204 No Content for favicon requests to prevent 503 errors
export async function GET() {
  return new NextResponse(null, { 
    status: 204,
    headers: {
      'Content-Type': 'image/x-icon',
    }
  })
}
