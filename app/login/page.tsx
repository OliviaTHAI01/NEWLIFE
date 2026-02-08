'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam) {
      if (errorParam === 'oauth_failed' || errorParam === 'token_failed') {
        setError('Invalid OAuth2 redirect_uri - กรุณาตรวจสอบการตั้งค่าใน Discord Developer Portal')
      } else if (errorParam === 'config') {
        setError('กรุณาตั้งค่า DISCORD_CLIENT_ID และ DISCORD_CLIENT_SECRET ใน Environment Variables ของ hosting platform')
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }
      // Clear error from URL
      window.history.replaceState({}, '', '/login')
    }

    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // Redirect to home page if logged in
          router.push('/')
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Next.js Discord Login</h1>
        <p className="login-description">
          Sign in with your Discord account to continue
        </p>
        {error && (
          <div className="login-error-message">
            <strong>⚠️ {error}</strong>
            {error.includes('redirect_uri') && (
              <div className="login-error-help">
                <p><strong>วิธีแก้ไข:</strong></p>
                <ol>
                  <li>ไปที่ <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">Discord Developer Portal</a></li>
                  <li>เลือก Application ของคุณ</li>
                  <li>ไปที่ <strong>OAuth2 → General</strong></li>
                  <li>ในส่วน <strong>Redirects</strong> เพิ่ม URL นี้:</li>
                  <li className="login-code-block">https://khaki-gnat-768759.hostingersite.com/api/auth/discord/callback</li>
                  <li>กด <strong>Save Changes</strong></li>
                </ol>
              </div>
            )}
          </div>
        )}
        <a href="/api/auth/discord" className="login-discord-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 71 55"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 49.9718 48.5383C51.038 50.6034 52.2554 52.5699 53.5951 54.435C53.651 54.5139 53.749 54.5477 53.8414 54.5195C59.6467 52.7249 65.5294 50.0174 71.6023 45.5576C71.6554 45.5182 71.6918 45.459 71.6974 45.3942C73.1647 30.0791 68.2145 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
              fill="currentColor"
            />
          </svg>
          Login with Discord
        </a>
      </div>
    </div>
  )
}
