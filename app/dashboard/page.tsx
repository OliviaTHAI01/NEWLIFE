'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

interface FactionApplication {
  id: string
  email: string
  headFactionName: string
  factionName: string
  factionStory: string
  members: string
  hoodLocation: string
  submittedAt: string
  status?: 'pending' | 'approved' | 'rejected'
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<FactionApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<FactionApplication | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: 'pending', notes: '' })
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and is admin
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          // Check admin status
          return fetch('/api/admin/check')
        } else {
          router.push('/login')
          return null
        }
      })
      .then(res => res ? res.json() : null)
      .then(data => {
        if (data) {
          console.log('Admin check response:', data)
          setDebugInfo(data.debug)
          setIsAdmin(data.isAdmin)
          if (!data.isAdmin) {
            setError(`คุณไม่มีสิทธิ์เข้าถึง Dashboard. Discord ID ของคุณ: ${data.userId || 'N/A'}. Admin IDs ที่ตั้งค่า: ${data.adminIds || 'ไม่มี'}`)
            // Don't redirect immediately, show error first
            setTimeout(() => {
              router.push('/')
            }, 3000)
          } else {
            // Load applications
            loadApplications()
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error checking admin:', err)
        setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์')
        setLoading(false)
      })
  }, [router])

  const loadApplications = async () => {
    try {
      const res = await fetch('/api/admin/factions')
      const data = await res.json()
      if (data.applications) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedApp) return

    try {
      const res = await fetch('/api/admin/factions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status: statusUpdate.status,
          notes: statusUpdate.notes
        })
      })

      const data = await res.json()
      if (data.success) {
        alert('อัปเดตสถานะสำเร็จ')
        setSelectedApp(null)
        loadApplications()
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
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

  if (!isAdmin && !loading) {
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
            </nav>
            <div className="user-section">
              {user?.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                  className="user-avatar"
                />
              )}
              <div className="user-info">
                <span className="username">{user?.username}</span>
                <button onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/login')
                }} className="logout-button">Logout</button>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="dashboard-header">
            <h1>Access Denied</h1>
            <p className="subtitle">คุณไม่มีสิทธิ์เข้าถึง Dashboard</p>
          </div>
          
          {error && (
            <div className="login-error-message" style={{ marginTop: '20px' }}>
              <strong>⚠️ {error}</strong>
            </div>
          )}

          {debugInfo && (
            <div style={{ marginTop: '20px', padding: '20px', background: '#f8f8f8', borderRadius: '8px' }}>
              <h3>Debug Information:</h3>
              <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" className="apply-button">กลับหน้าหลัก</Link>
          </p>
        </main>
      </div>
    )
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
            <Link href="/dashboard" className="nav-link active">Dashboard</Link>
          </nav>
          <div className="user-section">
            {user?.avatar && (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt={user.username}
                className="user-avatar"
              />
            )}
            <div className="user-info">
              <span className="username">{user?.username}</span>
              <button onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p className="subtitle">จัดการ Faction Applications</p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>ทั้งหมด</h3>
            <p className="stat-number">{applications.length}</p>
          </div>
          <div className="stat-card">
            <h3>รอตรวจสอบ</h3>
            <p className="stat-number">
              {applications.filter(app => !app.status || app.status === 'pending').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>อนุมัติ</h3>
            <p className="stat-number">
              {applications.filter(app => app.status === 'approved').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>ปฏิเสธ</h3>
            <p className="stat-number">
              {applications.filter(app => app.status === 'rejected').length}
            </p>
          </div>
        </div>

        <div className="applications-list">
          <h2>Faction Applications</h2>
          {applications.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีคำขอตั้ง Faction</p>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((app) => (
                <div key={app.id} className="application-card">
                  <div className="card-header">
                    <h3>{app.factionName}</h3>
                    <span className={`status-badge ${app.status || 'pending'}`}>
                      {app.status === 'approved' ? 'อนุมัติ' : 
                       app.status === 'rejected' ? 'ปฏิเสธ' : 'รอตรวจสอบ'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Head Faction:</strong> {app.headFactionName}</p>
                    <p><strong>Email:</strong> {app.email}</p>
                    <p><strong>Hood Location:</strong> {app.hoodLocation}</p>
                    <p><strong>Members:</strong> {app.members?.split('\n').length || 0} คน</p>
                    <p><strong>ส่งเมื่อ:</strong> {new Date(app.submittedAt).toLocaleString('th-TH')}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="btn-view"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>รายละเอียด Faction Application</h2>
                <button className="modal-close" onClick={() => setSelectedApp(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h3>ข้อมูลพื้นฐาน</h3>
                  <p><strong>Faction Name:</strong> {selectedApp.factionName}</p>
                  <p><strong>Head Faction:</strong> {selectedApp.headFactionName}</p>
                  <p><strong>Email:</strong> {selectedApp.email}</p>
                  <p><strong>Hood Location:</strong> {selectedApp.hoodLocation}</p>
                </div>

                <div className="detail-section">
                  <h3>เรื่องราวความเป็นมา</h3>
                  <div className="story-content">
                    {selectedApp.factionStory?.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>รายชื่อสมาชิก</h3>
                  <ul className="members-list">
                    {selectedApp.members?.split('\n').filter(m => m.trim()).map((member, i) => (
                      <li key={i}>{member}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h3>อัปเดตสถานะ</h3>
                  <div className="status-update-form">
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="status-select"
                    >
                      <option value="pending">รอตรวจสอบ</option>
                      <option value="approved">อนุมัติ</option>
                      <option value="rejected">ปฏิเสธ</option>
                    </select>
                    <textarea
                      placeholder="หมายเหตุ (ถ้ามี)"
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                      className="notes-textarea"
                      rows={3}
                    />
                    <button onClick={handleStatusUpdate} className="btn-update">
                      อัปเดตสถานะ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="main-footer">
        <p>&copy; 2024 NEW LIFE Roleplay. All rights reserved.</p>
      </footer>
    </div>
  )
}
