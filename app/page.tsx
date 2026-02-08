'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Disable static generation
export const dynamic = 'force-dynamic'

interface User {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

export default function Home() {
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
          // Redirect to login if not authenticated
          router.push('/login')
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
        setLoading(false)
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

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
            <h1 className="logo">NEW LIFE</h1>
            <p className="tagline">Roleplay Community</p>
          </div>
          <nav className="main-nav">
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Rules</a>
            <a href="#" className="nav-link">Forums</a>
            <a href="#" className="nav-link">Support</a>
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
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome to NEW LIFE</h2>
            <p>Your roleplay adventure begins here</p>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <div className="card-icon">
              <img src="/images/icons/lfm.png" alt="LFM" onError={(e) => {
                const img = e.currentTarget;
                const span = img.nextElementSibling as HTMLElement;
                if (span) {
                  img.style.display = 'none';
                  span.style.display = 'block';
                }
              }} />
              <span style={{ display: 'none' }}>🚗</span>
            </div>
            <h3>LFM</h3>
            <p>Illegal Faction Management : NEW LIFE RP</p>
            <Link href="/lfm" className="card-button">View LFM</Link>
          </div>

          <div className="content-card">
            <div className="card-icon">
              <img src="/images/icons/lspd.png" alt="LSPD" onError={(e) => {
                const img = e.currentTarget;
                const span = img.nextElementSibling as HTMLElement;
                if (span) {
                  img.style.display = 'none';
                  span.style.display = 'block';
                }
              }} />
              <span style={{ display: 'none' }}>🚔</span>
            </div>
            <h3>LSPD</h3>
            <p>Los Santos Police Department</p>
            <button className="card-button">View LSPD</button>
          </div>

          <div className="content-card">
            <div className="card-icon">
              <img src="/images/icons/lssd.png" alt="LSSD" onError={(e) => {
                const img = e.currentTarget;
                const span = img.nextElementSibling as HTMLElement;
                if (span) {
                  img.style.display = 'none';
                  span.style.display = 'block';
                }
              }} />
              <span style={{ display: 'none' }}>🚓</span>
            </div>
            <h3>LSSD</h3>
            <p>Los Santos Sheriff's Department</p>
            <button className="card-button">View LSSD</button>
          </div>

          <div className="content-card">
            <div className="card-icon">
              <img src="/images/icons/lsfd.png" alt="LSFD" onError={(e) => {
                const img = e.currentTarget;
                const span = img.nextElementSibling as HTMLElement;
                if (span) {
                  img.style.display = 'none';
                  span.style.display = 'block';
                }
              }} />
              <span style={{ display: 'none' }}>🚒</span>
            </div>
            <h3>LSFD</h3>
            <p>Los Santos Fire Department</p>
            <button className="card-button">View LSFD</button>
          </div>

          <div className="content-card">
            <div className="card-icon">
              <img src="/images/icons/lsmc.png" alt="LSMC" onError={(e) => {
                const img = e.currentTarget;
                const span = img.nextElementSibling as HTMLElement;
                if (span) {
                  img.style.display = 'none';
                  span.style.display = 'block';
                }
              }} />
              <span style={{ display: 'none' }}>🏥</span>
            </div>
            <h3>LSMC</h3>
            <p>Los Santos Medical Center</p>
            <button className="card-button">View LSMC</button>
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
