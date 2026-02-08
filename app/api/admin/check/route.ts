import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Get admin Discord IDs from environment variable
// Format: "id1,id2,id3" or single ID
function getAdminIds(): string[] {
  const adminIds = process.env.ADMIN_DISCORD_IDS || process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS || ''
  console.log('[Admin Check] Raw ADMIN_DISCORD_IDS:', process.env.ADMIN_DISCORD_IDS)
  console.log('[Admin Check] Raw NEXT_PUBLIC_ADMIN_DISCORD_IDS:', process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS)
  
  if (!adminIds) {
    console.log('[Admin Check] No admin IDs found in environment variables')
    return []
  }
  
  const ids = adminIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
  console.log('[Admin Check] Parsed admin IDs:', ids)
  return ids
}

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get('discord_user')

    if (!userCookie) {
      return NextResponse.json({ isAdmin: false, message: 'Not authenticated' }, { status: 200 })
    }

    try {
      const user = JSON.parse(userCookie.value)
      const adminIds = getAdminIds()
      
      console.log('[Admin Check] User ID:', user.id)
      console.log('[Admin Check] Admin IDs:', adminIds)
      console.log('[Admin Check] Environment ADMIN_DISCORD_IDS:', process.env.ADMIN_DISCORD_IDS)
      
      const isAdmin = adminIds.includes(user.id)
      
      console.log('[Admin Check] Is Admin:', isAdmin)
      
      return NextResponse.json({ 
        isAdmin,
        userId: user.id,
        username: user.username,
        adminIds: adminIds.length > 0 ? adminIds : 'No admins configured',
        debug: {
          userDiscordId: user.id,
          configuredAdminIds: adminIds,
          envVar: process.env.ADMIN_DISCORD_IDS || 'NOT SET'
        }
      }, { status: 200 })
    } catch (parseError) {
      return NextResponse.json({ isAdmin: false, message: 'Invalid user data' }, { status: 200 })
    }
  } catch (error) {
    console.error('Error in /api/admin/check:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
