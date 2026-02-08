import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const email = formData.get('email') as string
    const headFactionName = formData.get('headFactionName') as string
    const factionName = formData.get('factionName') as string
    const factionStory = formData.get('factionStory') as string
    const members = formData.get('members') as string
    const hoodLocation = formData.get('hoodLocation') as string

    // Validate required fields
    if (!email || !headFactionName || !factionName || !factionStory || !members || !hoodLocation) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Validate story length (minimum 5 lines)
    const storyLines = factionStory.split('\n').filter(line => line.trim().length > 0)
    if (storyLines.length < 5) {
      return NextResponse.json(
        { error: 'เรื่องราวความเป็นมาของ Faction ต้องไม่ต่ำกว่า 5 บรรทัด' },
        { status: 400 }
      )
    }

    // Validate members (minimum 3)
    const memberList = members.split('\n').filter(m => m.trim().length > 0)
    if (memberList.length < 3) {
      return NextResponse.json(
        { error: 'รายชื่อสมาชิกต้องมีขั้นต่ำ 3 คนขึ้นไป' },
        { status: 400 }
      )
    }

    // Handle hood images
    const hoodImages: File[] = []
    let hoodImageIndex = 0
    while (formData.get(`hoodImage_${hoodImageIndex}`)) {
      const file = formData.get(`hoodImage_${hoodImageIndex}`) as File
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: `ไฟล์รูปภาพที่ ${hoodImageIndex + 1} มีขนาดเกิน 100 MB` },
          { status: 400 }
        )
      }
      hoodImages.push(file)
      hoodImageIndex++
    }

    if (hoodImages.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดรูปภาพที่ตั้ง HOOD' },
        { status: 400 }
      )
    }

    if (hoodImages.length > 5) {
      return NextResponse.json(
        { error: 'อัปโหลดรูปภาพได้สูงสุด 5 ไฟล์' },
        { status: 400 }
      )
    }

    // Handle clothing files
    const clothingFiles: File[] = []
    let clothingFileIndex = 0
    while (formData.get(`clothingFile_${clothingFileIndex}`)) {
      const file = formData.get(`clothingFile_${clothingFileIndex}`) as File
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: `ไฟล์เสื้อผ้าที่ ${clothingFileIndex + 1} มีขนาดเกิน 100 MB` },
          { status: 400 }
        )
      }
      clothingFiles.push(file)
      clothingFileIndex++
    }

    if (clothingFiles.length === 0) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดไฟล์เสื้อผ้าของ Faction' },
        { status: 400 }
      )
    }

    if (clothingFiles.length > 5) {
      return NextResponse.json(
        { error: 'อัปโหลดไฟล์เสื้อผ้าได้สูงสุด 5 ไฟล์' },
        { status: 400 }
      )
    }

    // Save to database
    const pool = getPool()
    const connection = await pool.getConnection()
    
    try {
      // Insert faction application
      const [result] = await connection.execute(
        `INSERT INTO factions 
         (email, head_faction_name, faction_name, faction_story, members, hood_location, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [email, headFactionName, factionName, factionStory, members, hoodLocation]
      ) as any

      const factionId = result.insertId

      // TODO: Save files to storage (S3, local storage, etc.) and store file paths
      // For now, we'll just log the file information
      console.log('Faction Application Submission:', {
        factionId,
        email,
        headFactionName,
        factionName,
        hoodImagesCount: hoodImages.length,
        clothingFilesCount: clothingFiles.length,
      })

      // TODO: Save files and insert file paths into faction_files table
      // Example:
      // for (const file of hoodImages) {
      //   const filePath = await saveFile(file, 'hood_image')
      //   await connection.execute(
      //     `INSERT INTO faction_files (faction_id, file_type, file_path, file_name, file_size) 
      //      VALUES (?, 'hood_image', ?, ?, ?)`,
      //     [factionId, filePath, file.name, file.size]
      //   )
      // }

      await connection.commit()

      return NextResponse.json({
        success: true,
        message: 'ส่งคำขอสำเร็จ กรุณารอการตรวจสอบจาก Staff',
        factionId
      })
    } catch (dbError: any) {
      await connection.rollback()
      console.error('Database error:', dbError)
      throw dbError
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Faction application error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งข้อมูล' },
      { status: 500 }
    )
  }
}
