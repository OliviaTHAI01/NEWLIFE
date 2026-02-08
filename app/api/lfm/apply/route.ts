import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

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

    // Create submission directory
    const timestamp = Date.now()
    const submissionDir = join(process.cwd(), 'public', 'submissions', `faction_${timestamp}`)
    
    // In production, you would save files to a proper storage solution
    // For now, we'll just log the submission data
    console.log('Faction Application Submission:', {
      email,
      headFactionName,
      factionName,
      factionStory,
      members,
      hoodLocation,
      hoodImagesCount: hoodImages.length,
      clothingFilesCount: clothingFiles.length,
      timestamp
    })

    // TODO: Save files to storage (S3, local storage, etc.)
    // TODO: Send notification email to staff
    // TODO: Store submission in database

    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอสำเร็จ กรุณารอการตรวจสอบจาก Staff'
    })
  } catch (error) {
    console.error('Faction application error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งข้อมูล' },
      { status: 500 }
    )
  }
}
