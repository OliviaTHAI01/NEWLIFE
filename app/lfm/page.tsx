'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

export default function LFMPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
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

  const copyDiscordId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
                onClick={() => setShowProfile(true)}
                style={{ cursor: 'pointer' }}
              />
            )}
            <div className="user-info">
              <span 
                className="username"
                onClick={() => setShowProfile(true)}
                style={{ cursor: 'pointer' }}
              >
                {user.username}
              </span>
              <button onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="lfm-header">
          <h1>Illegal Faction Management</h1>
          <p className="subtitle">ประกาศจากเซิร์ฟเวอร์ NEW LIFE RP</p>
        </div>

        <div className="lfm-content">
          <div className="info-section">
            <h2>เกี่ยวกับ Illegal Faction (Heavy Roleplay)</h2>
            <p>
              กฎและแนวทางสำหรับ Illegal Faction (Heavy Roleplay) บนเซิร์ฟเวอร์ NEW LIFE RP 
              เพื่อยกระดับคุณภาพ Roleplay และสร้างสภาพแวดล้อมการเล่นเกมที่สมจริง 
              กฎเหล่านี้เป็นข้อบังคับสำหรับผู้เล่นทุกคนโดยไม่มีข้อยกเว้น
            </p>
          </div>

          <div className="rules-section">
            <h3>วัตถุประสงค์</h3>
            <ul>
              <li>Illegal Faction ใช้สำหรับสร้าง Storyline และความขัดแย้งที่ขับเคลื่อนด้วยตัวละคร</li>
              <li>ไม่ใช่สำหรับการใช้ weapons, การชนะ, หรือการได้เปรียบเชิงระบบ</li>
            </ul>

            <h3>ผู้เล่นทุกคนต้องยึดหลัก:</h3>
            <ul>
              <li><strong>Roleplay before Gunplay</strong> - Roleplay มาก่อน Gunplay</li>
              <li><strong>Value of Life</strong> - เคารพชีวิตของตัวละคร</li>
              <li><strong>No OOC Information</strong> - ไม่อนุญาตให้ใช้ข้อมูล OOC เพื่อการตัดสินใจ IC</li>
            </ul>

            <h3>แนวคิดหลัก (บังคับใช้จริง)</h3>
            <ul>
              <li>Illegal Faction ใช้สำหรับสร้าง Storyline แบบระยะยาว</li>
              <li>ไม่ใช่ระบบสำหรับ money farming / conflict / city control</li>
              <li>Roleplay ต้องมาก่อน Gunplay เสมอ</li>
              <li>Staff มีอำนาจสูงสุดในการรักษาคุณภาพ RP</li>
            </ul>

            <h3>โครงสร้างแฟคชั่น</h3>
            <div className="table-container">
              <table className="faction-table">
                <thead>
                  <tr>
                    <th>ตำแหน่ง</th>
                    <th>หน้าที่</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Head Faction</strong></td>
                    <td>คุมทิศทาง RP / รับผิดชอบสมาชิกทั้งหมด</td>
                  </tr>
                  <tr>
                    <td><strong>Underboss</strong></td>
                    <td>ควบคุมปฏิบัติการ / แก้ปัญหาเฉพาะหน้า</td>
                  </tr>
                  <tr>
                    <td><strong>Member</strong></td>
                    <td>ปฏิบัติตามคำสั่ง IC อย่างสมเหตุสมผล</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="apply-section">
            <h2>สมัครขอตั้ง Faction</h2>
            <p>กรุณากรอกข้อมูลให้ครบถ้วนเพื่อยื่นคำขอตั้ง Faction</p>
            <Link href="/lfm/apply" className="apply-button">
              สมัครขอตั้ง Faction
            </Link>
          </div>
        </div>
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 NEW LIFE Roleplay. All rights reserved.</p>
      </footer>

      {showProfile && user && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>โปรไฟล์</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar-section">
                {user.avatar && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="profile-avatar-large"
                  />
                )}
                <h3>{user.username}</h3>
                {user.discriminator && user.discriminator !== '0' && (
                  <p className="discriminator">#{user.discriminator}</p>
                )}
              </div>

              <div className="profile-info-section">
                <div className="info-item">
                  <label>Discord ID</label>
                  <div className="discord-id-container">
                    <code className="discord-id">{user.id}</code>
                    <button 
                      onClick={copyDiscordId}
                      className={`copy-button ${copied ? 'copied' : ''}`}
                      title="คัดลอก Discord ID"
                    >
                      {copied ? '✓ คัดลอกแล้ว' : '📋 คัดลอก'}
                    </button>
                  </div>
                </div>

                {user.email && (
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
