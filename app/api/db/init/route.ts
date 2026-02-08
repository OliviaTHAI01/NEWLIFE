import { NextResponse } from 'next/server'
import { initDatabase, testConnection } from '../../../../lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test connection first
    const connectionOk = await testConnection()
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Initialize tables
    await initDatabase()

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Database initialization failed',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
