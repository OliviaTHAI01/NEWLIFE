import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getBaseUrl(request: NextRequest): string {
  // Use environment variable if available
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Use DISCORD_REDIRECT_URI base if available
  const redirectUri = process.env.DISCORD_REDIRECT_URI
  if (redirectUri) {
    try {
      const url = new URL(redirectUri)
      return `${url.protocol}//${url.host}`
    } catch (e) {
      // Fall through to header-based detection
    }
  }
  
  // Fallback: use request headers
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  
  if (host) {
    return `${protocol}://${host}`
  }
  
  // Final fallback
  return 'https://khaki-gnat-768759.hostingersite.com'
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const baseUrl = getBaseUrl(request)

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://khaki-gnat-768759.hostingersite.com/api/auth/discord/callback'

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?error=config`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('Discord token error:', tokenData)
      const errorMessage = tokenData.error_description || tokenData.error || 'token_failed'
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`)
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Create response and set cookie
    const response = NextResponse.redirect(`${baseUrl}/`)
    
    // Store user data in cookie (in production, use httpOnly and secure cookies)
    response.cookies.set('discord_user', JSON.stringify({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      email: userData.email,
    }), {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
  }
}
