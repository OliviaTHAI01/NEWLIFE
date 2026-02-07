'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
              />
            )}
            <div className="user-info">
              <span className="username">{user.username}</span>
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
            <button className="card-button">View LFM</button>
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
    </div>
  )
}
