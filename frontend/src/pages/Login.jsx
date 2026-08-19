import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// Map HTTP status / error messages to friendly text
function getFriendlyError(err) {
  const status = err?.response?.status
  const msg    = (err?.response?.data?.message || err?.response?.data?.error || '').toLowerCase()

  if (status === 401 || msg.includes('password') || msg.includes('invalid') || msg.includes('incorrect')) {
    return 'Password is incorrect. Please try again.'
  }
  if (status === 404 || msg.includes('not found') || msg.includes('no user') || msg.includes('email')) {
    return 'No account found with that email address.'
  }
  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (status === 500) {
    return 'Server error. Please try again later.'
  }
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network.'
  }
  return 'Login failed. Please check your credentials and try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('') // clear error on typing
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(getFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        
        {/* Left Branding Panel */}
        <div style={s.leftPanel}>
          {/* Top Logo */}
          <div style={s.logoRow}>
            <div style={s.logoIcon}>💧</div>
            <span style={s.logoText}>LifeLink</span>
          </div>

          {/* Middle Main Content */}
          <div style={s.leftContent}>
            <div style={s.leftTag}>BLOOD DONATION MANAGEMENT</div>
            <h1 style={s.leftTitle}>Every donation can save a life.</h1>
            <p style={s.leftDesc}>
              Manage donors, blood inventory, and urgent requests with confidence from one secure place.
            </p>
          </div>

          {/* Bottom Footer Note */}
          <div style={s.leftFooter}>
            <span style={s.dot}>●</span> Working together for healthier communities
          </div>

          {/* Decorative curved background circles */}
          <div style={s.decorCircle1} />
          <div style={s.decorCircle2} />
        </div>

        {/* Right Form Panel */}
        <div style={s.rightPanel}>
          <div style={{ marginBottom: 20 }}>
            <Link to="/home" style={{ textDecoration: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, display: 'inline-block', padding: '4px 8px', borderRadius: '4px', background: '#f3f4f6' }}>
              ← Back to Home
            </Link>
          </div>
          <div style={s.formHeader}>
            <div style={s.welcomeTag}>WELCOME BACK</div>
            <h2 style={s.formTitle}>Sign in to your account</h2>
            <p style={s.formSub}>Enter your details to access the dashboard.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            
            {/* Email Field */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Email address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉️</span>
                <input
                  style={{ ...s.input, borderColor: error ? '#fca5a5' : '#e2e8f0' }}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@bloodbank.local"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={s.fieldGroup}>
              <div style={s.passLabelRow}>
                <label style={s.label}>Password</label>
                <button
                  type="button"
                  style={s.showToggleBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  style={{ ...s.input, borderColor: error ? '#fca5a5' : '#e2e8f0' }}
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <span style={s.spinnerRow}>
                  <span style={s.btnSpinner} /> Signing in…
                </span>
              ) : (
                'Sign in →'
              )}
            </button>

          </form>

          {/* Bottom Security Note */}
          <div style={s.securityNote}>
            <span style={{ fontSize: 10 }}>●</span> Secure access for authorised blood bank staff
          </div>

        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 768px) {
          .login-container {
            flex-direction: column !important;
            max-width: 440px !important;
          }
          .login-left-panel {
            padding: 32px 24px !important;
            min-height: auto !important;
          }
          .login-right-panel {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ─── Premium Split Design Styles ──────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e8e5e5',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '24px 16px',
    boxSizing: 'border-box',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: 920,
    minHeight: 540,
    background: '#ffffff',
    borderRadius: 24,
    boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    animation: 'fadeIn 0.4s ease',
  },
  /* Left Panel (Crimson Red) */
  leftPanel: {
    flex: '1 1 48%',
    background: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    zIndex: 2,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#ffffff',
  },
  leftContent: {
    zIndex: 2,
    margin: '36px 0',
  },
  leftTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  leftTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.25,
    margin: '0 0 16px',
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  leftDesc: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.78)',
    margin: 0,
    maxWidth: 340,
  },
  leftFooter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    fontSize: 8,
    color: '#f87171',
  },
  decorCircle1: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },

  /* Right Form Panel */
  rightPanel: {
    flex: '1 1 52%',
    background: '#ffffff',
    padding: '48px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formHeader: {
    marginBottom: 28,
  },
  welcomeTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  formTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px',
    letterSpacing: '-0.01em',
  },
  formSub: {
    fontSize: 13,
    color: '#6b7280',
    margin: 0,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  passLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showToggleBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    fontSize: 15,
    color: '#9ca3af',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '12px 14px 12px 38px',
    fontSize: 14,
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
  },
  submitBtn: {
    marginTop: 8,
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    padding: '13px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s',
    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
  },
  spinnerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSpinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
}
