import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Get admin Discord IDs from environment variable
function getAdminIds(): string[] {
  const adminIds = process.env.ADMIN_DISCORD_IDS || ''
  if (!adminIds) return []
  return adminIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
}

// Check if user is admin
async function checkAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  const userCookie = request.cookies.get('discord_user')
  if (!userCookie) {
    return { isAdmin: false }
  }

  try {
    const user = JSON.parse(userCookie.value)
    const adminIds = getAdminIds()
    return { isAdmin: adminIds.includes(user.id), userId: user.id }
  } catch {
    return { isAdmin: false }
  }
}

// GET - Get all faction applications
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // TODO: Replace with database query when database is set up
    // For now, return empty array or mock data
    const submissionsDir = join(process.cwd(), 'public', 'submissions')
    
    try {
      const folders = await readdir(submissionsDir, { withFileTypes: true })
      const applications = await Promise.all(
        folders
          .filter(folder => folder.isDirectory() && folder.name.startsWith('faction_'))
          .map(async (folder) => {
            try {
              const dataFile = join(submissionsDir, folder.name, 'data.json')
              const data = await readFile(dataFile, 'utf-8')
              return {
                id: folder.name,
                ...JSON.parse(data),
                submittedAt: new Date(parseInt(folder.name.split('_')[1])).toISOString()
              }
            } catch {
              return {
                id: folder.name,
                submittedAt: new Date(parseInt(folder.name.split('_')[1])).toISOString()
              }
            }
          })
      )
      
      return NextResponse.json({ applications }, { status: 200 })
    } catch (error) {
      // Directory doesn't exist or empty
      return NextResponse.json({ applications: [] }, { status: 200 })
    }
  } catch (error) {
    console.error('Error in /api/admin/factions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update application status (approve/reject)
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdmin(request)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, status, notes } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, status' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, rejected, or pending' },
        { status: 400 }
      )
    }

    // TODO: Update in database when database is set up
    // For now, just return success
    console.log('Application status update:', { applicationId, status, notes })

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      applicationId,
      status,
      notes
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
