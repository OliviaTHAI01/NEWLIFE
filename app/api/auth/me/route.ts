import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userCookie = request.cookies.get('discord_user')

  if (!userCookie) {
    return NextResponse.json({ user: null })
  }

  try {
    const user = JSON.parse(userCookie.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
