'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './apply.css'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

interface FormData {
  email: string
  headFactionName: string
  factionName: string
  factionStory: string
  members: string
  hoodLocation: string
  hoodImages: File[]
  clothingFiles: File[]
}

export default function ApplyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    headFactionName: '',
    factionName: '',
    factionStory: '',
    members: '',
    hoodLocation: '',
    hoodImages: [],
    clothingFiles: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          // Pre-fill email with Discord email if available
          if (data.user.email) {
            setFormData(prev => ({ ...prev, email: data.user.email }))
          }
        } else {
          router.push('/login')
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
        setLoading(false)
      })
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hoodImages' | 'clothingFiles') => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, [type]: files }))
    if (errors[type]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[type]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมลล์'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลล์ไม่ถูกต้อง'
    }

    if (!formData.headFactionName.trim()) {
      newErrors.headFactionName = 'กรุณากรอกชื่อ IC (Head Faction)'
    }

    if (!formData.factionName.trim()) {
      newErrors.factionName = 'กรุณากรอกชื่อ Faction'
    }

    if (!formData.factionStory.trim()) {
      newErrors.factionStory = 'กรุณากรอกเรื่องราวความเป็นมาของ Faction'
    } else {
      const lines = formData.factionStory.split('\n').filter(line => line.trim().length > 0)
      if (lines.length < 5) {
        newErrors.factionStory = 'เรื่องราวความเป็นมาของ Faction ต้องไม่ต่ำกว่า 5 บรรทัด'
      }
    }

    if (!formData.members.trim()) {
      newErrors.members = 'กรุณากรอกรายชื่อสมาชิกของ Faction'
    } else {
      const memberList = formData.members.split('\n').filter(m => m.trim().length > 0)
      if (memberList.length < 3) {
        newErrors.members = 'รายชื่อสมาชิกต้องมีขั้นต่ำ 3 คนขึ้นไป'
      }
    }

    if (!formData.hoodLocation.trim()) {
      newErrors.hoodLocation = 'กรุณากรอกที่ตั้ง HOOD'
    }

    if (formData.hoodImages.length === 0) {
      newErrors.hoodImages = 'กรุณาอัปโหลดรูปภาพที่ตั้ง HOOD'
    } else {
      // Validate file sizes
      formData.hoodImages.forEach((file, index) => {
        if (file.size > 100 * 1024 * 1024) {
          newErrors.hoodImages = `ไฟล์รูปภาพที่ ${index + 1} มีขนาดเกิน 100 MB`
        }
      })
    }

    if (formData.clothingFiles.length === 0) {
      newErrors.clothingFiles = 'กรุณาอัปโหลดไฟล์เสื้อผ้าของ Faction'
    } else {
      formData.clothingFiles.forEach((file, index) => {
        if (file.size > 100 * 1024 * 1024) {
          newErrors.clothingFiles = `ไฟล์เสื้อผ้าที่ ${index + 1} มีขนาดเกิน 100 MB`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('email', formData.email)
      submitData.append('headFactionName', formData.headFactionName)
      submitData.append('factionName', formData.factionName)
      submitData.append('factionStory', formData.factionStory)
      submitData.append('members', formData.members)
      submitData.append('hoodLocation', formData.hoodLocation)

      formData.hoodImages.forEach((file, index) => {
        submitData.append(`hoodImage_${index}`, file)
      })

      formData.clothingFiles.forEach((file, index) => {
        submitData.append(`clothingFile_${index}`, file)
      })

      const response = await fetch('/api/lfm/apply', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        // Reset form
        setFormData({
          email: user?.email || '',
          headFactionName: '',
          factionName: '',
          factionStory: '',
          members: '',
          hoodLocation: '',
          hoodImages: [],
          clothingFiles: []
        })
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="index-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="index-container">
      <header className="main-header">
        <div className="header-content">
          <div className="logo-section">
            <Link href="/">
              <h1 className="logo">NEW LIFE</h1>
            </Link>
            <p className="tagline">Roleplay Community</p>
          </div>
          <nav className="main-nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/lfm" className="nav-link">LFM</Link>
            <Link href="/lspd" className="nav-link">LSPD</Link>
            <Link href="/lssd" className="nav-link">LSSD</Link>
            <Link href="/lsfd" className="nav-link">LSFD</Link>
            <Link href="/lsmc" className="nav-link">LSMC</Link>
          </nav>
          <div className="user-section">
            {user.avatar && (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt={user.username}
                className="user-avatar"
              />
            )}
            <div className="user-info">
              <span className="username">{user.username}</span>
              <button onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="apply-page-header">
          <Link href="/lfm" className="back-link">← กลับไปหน้า LFM</Link>
          <h1>ฟอร์มสมัครขอตั้ง Faction</h1>
          <p>กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง</p>
        </div>

        {submitSuccess ? (
          <div className="success-message">
            <h2>✅ ส่งคำขอสำเร็จ!</h2>
            <p>คำขอของคุณได้รับการส่งเรียบร้อยแล้ว กรุณารอการตรวจสอบจาก Staff</p>
            <Link href="/lfm" className="back-button">กลับไปหน้า LFM</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="apply-form">
            <div className="form-section">
              <label htmlFor="email" className="required">
                อีเมลล์ *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="example@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-section">
              <label htmlFor="headFactionName" className="required">
                ชื่อ IC (Head Faction) *
              </label>
              <input
                type="text"
                id="headFactionName"
                name="headFactionName"
                value={formData.headFactionName}
                onChange={handleInputChange}
                className={errors.headFactionName ? 'error' : ''}
                placeholder="กรุณากรอกชื่อ IC ของ Head Faction"
              />
              {errors.headFactionName && <span className="error-message">{errors.headFactionName}</span>}
            </div>

            <div className="form-section">
              <label htmlFor="factionName" className="required">
                ชื่อ Faction *
              </label>
              <input
                type="text"
                id="factionName"
                name="factionName"
                value={formData.factionName}
                onChange={handleInputChange}
                className={errors.factionName ? 'error' : ''}
                placeholder="กรุณากรอกชื่อ Faction"
              />
              {errors.factionName && <span className="error-message">{errors.factionName}</span>}
            </div>

            <div className="form-section">
              <label htmlFor="factionStory" className="required">
                เรื่องราวความเป็นมาของ Faction (ไม่ต่ำกว่า 5 บรรทัด) *
              </label>
              <textarea
                id="factionStory"
                name="factionStory"
                value={formData.factionStory}
                onChange={handleInputChange}
                className={errors.factionStory ? 'error' : ''}
                placeholder="กรุณาเล่าเรื่องราวความเป็นมาของ Faction อย่างละเอียด (ไม่ต่ำกว่า 5 บรรทัด)"
                rows={8}
              />
              {errors.factionStory && <span className="error-message">{errors.factionStory}</span>}
              <p className="helper-text">บรรทัดปัจจุบัน: {formData.factionStory.split('\n').filter(line => line.trim().length > 0).length} / 5 บรรทัดขั้นต่ำ</p>
            </div>

            <div className="form-section">
              <label htmlFor="members" className="required">
                รายชื่อสมาชิกของ Faction *ขั้นต่ำ 3 คนขึ้นไป (สามารถเปิด Ticket เพิ่มรายชื่อทีหลังได้) *
              </label>
              <textarea
                id="members"
                name="members"
                value={formData.members}
                onChange={handleInputChange}
                className={errors.members ? 'error' : ''}
                placeholder="กรุณากรอกรายชื่อสมาชิกทีละคน (1 บรรทัดต่อ 1 คน)&#10;ตัวอย่าง:&#10;1. ชื่อ IC - Discord Username&#10;2. ชื่อ IC - Discord Username&#10;3. ชื่อ IC - Discord Username"
                rows={6}
              />
              {errors.members && <span className="error-message">{errors.members}</span>}
              <p className="helper-text">จำนวนสมาชิก: {formData.members.split('\n').filter(m => m.trim().length > 0).length} / 3 คนขั้นต่ำ</p>
            </div>

            <div className="form-section">
              <label htmlFor="hoodLocation" className="required">
                ที่ตั้ง HOOD (พร้อมแนบรูปภาพ) *
              </label>
              <input
                type="text"
                id="hoodLocation"
                name="hoodLocation"
                value={formData.hoodLocation}
                onChange={handleInputChange}
                className={errors.hoodLocation ? 'error' : ''}
                placeholder="กรุณากรอกที่ตั้ง HOOD (เช่น: Grove Street, Los Santos)"
              />
              {errors.hoodLocation && <span className="error-message">{errors.hoodLocation}</span>}
            </div>

            <div className="form-section">
              <label htmlFor="hoodImages" className="required">
                อัปโหลดรูปภาพที่ตั้ง HOOD *
              </label>
              <input
                type="file"
                id="hoodImages"
                name="hoodImages"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'hoodImages')}
                className={errors.hoodImages ? 'error' : ''}
              />
              <p className="helper-text">
                รองรับสูงสุด 5 รายการ ขนาดสูงสุด 100 MB ต่อไฟล์
                {formData.hoodImages.length > 0 && ` (อัปโหลดแล้ว: ${formData.hoodImages.length} ไฟล์)`}
              </p>
              {errors.hoodImages && <span className="error-message">{errors.hoodImages}</span>}
              {formData.hoodImages.length > 0 && (
                <div className="file-list">
                  {formData.hoodImages.map((file, index) => (
                    <div key={index} className="file-item">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-section">
              <label htmlFor="clothingFiles" className="required">
                ไฟล์เสื้อผ้าของ Faction (ฟรี 1 slot ไม่จำกัด Texture) *
              </label>
              <input
                type="file"
                id="clothingFiles"
                name="clothingFiles"
                accept=".ytd,.ydd,.yft,.ytf"
                multiple
                onChange={(e) => handleFileChange(e, 'clothingFiles')}
                className={errors.clothingFiles ? 'error' : ''}
              />
              <p className="helper-text">
                รองรับสูงสุด 5 รายการ ขนาดสูงสุด 100 MB ต่อไฟล์
                {formData.clothingFiles.length > 0 && ` (อัปโหลดแล้ว: ${formData.clothingFiles.length} ไฟล์)`}
              </p>
              {errors.clothingFiles && <span className="error-message">{errors.clothingFiles}</span>}
              {formData.clothingFiles.length > 0 && (
                <div className="file-list">
                  {formData.clothingFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอ'}
              </button>
              <Link href="/lfm" className="cancel-button">ยกเลิก</Link>
            </div>
          </form>
        )}
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 NEW LIFE Roleplay. All rights reserved.</p>
      </footer>
    </div>
  )
}
