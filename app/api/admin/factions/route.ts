import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

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

    // Get applications from database
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT 
        id,
        email,
        head_faction_name as headFactionName,
        faction_name as factionName,
        faction_story as factionStory,
        members,
        hood_location as hoodLocation,
        status,
        notes,
        submitted_at as submittedAt,
        updated_at as updatedAt
       FROM factions 
       ORDER BY submitted_at DESC`
    ) as any

    const applications = rows.map((row: any) => ({
      id: row.id.toString(),
      email: row.email,
      headFactionName: row.headFactionName,
      factionName: row.factionName,
      factionStory: row.factionStory,
      members: row.members,
      hoodLocation: row.hoodLocation,
      status: row.status,
      notes: row.notes,
      submittedAt: row.submittedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }))

    return NextResponse.json({ applications }, { status: 200 })
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

    // Update status in database
    const pool = getPool()
    const connection = await pool.getConnection()
    
    try {
      await connection.execute(
        `UPDATE factions 
         SET status = ?, notes = ? 
         WHERE id = ?`,
        [status, notes || null, applicationId]
      )

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'Application status updated successfully',
        applicationId,
        status,
        notes
      }, { status: 200 })
    } catch (dbError: any) {
      await connection.rollback()
      console.error('Database update error:', dbError)
      throw dbError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
