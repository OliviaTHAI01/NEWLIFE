import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

function getBaseUrl(request: NextRequest | null): string {
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
  
  // Fallback: use request headers if available
  if (request) {
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    
    if (host) {
      return `${protocol}://${host}`
    }
  }
  
  // Final fallback
  return 'https://khaki-gnat-768759.hostingersite.com'
}

export async function GET(request: NextRequest) {
  try {
    // Ensure request is available
    if (!request) {
      console.error('Request object is null')
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const clientId = process.env.DISCORD_CLIENT_ID
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'https://khaki-gnat-768759.hostingersite.com/api/auth/discord/callback'
    
    if (!clientId) {
      console.error('Discord Client ID not configured')
      const baseUrl = getBaseUrl(request)
      return NextResponse.redirect(`${baseUrl}/login?error=config`, { status: 302 })
    }

    // Validate redirect URI format
    let validRedirectUri: string
    try {
      const url = new URL(redirectUri)
      validRedirectUri = redirectUri
    } catch (e) {
      console.error('Invalid DISCORD_REDIRECT_URI format:', redirectUri)
      const baseUrl = getBaseUrl(request)
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_redirect_uri`, { status: 302 })
    }

    // Build OAuth URL with proper encoding
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: validRedirectUri,
      response_type: 'code',
      scope: 'identify email',
    })

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`

    return NextResponse.redirect(discordAuthUrl, { status: 302 })
  } catch (error) {
    console.error('Error in /api/auth/discord:', error)
    // Log full error details
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    try {
      const baseUrl = getBaseUrl(request || null)
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_init_failed`, { status: 302 })
    } catch (redirectError) {
      // If redirect fails, return JSON error
      console.error('Failed to redirect:', redirectError)
      return NextResponse.json(
        { error: 'OAuth initialization failed' },
        { status: 500 }
      )
    }
  }
}
