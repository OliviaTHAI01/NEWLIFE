import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('discord_user')

    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    try {
      const user = JSON.parse(userCookie.value)
      return NextResponse.json({ user }, { status: 200 })
    } catch (parseError) {
      // Invalid cookie format, clear it and return null
      const response = NextResponse.json({ user: null }, { status: 200 })
      response.cookies.delete('discord_user')
      return response
    }
  } catch (error) {
    // Log error for debugging
    console.error('Error in /api/auth/me:', error)
    // Return a proper error response instead of letting it throw
    return NextResponse.json(
      { user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
