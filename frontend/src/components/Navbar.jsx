import { NavLink } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function Navbar() {
  const { toggleSidebar } = useAppContext()

  return (
    <header style={s.navbar}>
      <div style={s.container}>
        
        {/* Left Side: Toggle button & Logo */}
        <div style={s.leftSection}>
          <button
            type="button"
            onClick={toggleSidebar}
            style={s.toggleBtn}
            aria-label="Toggle sidebar"
          >
            <span style={s.hamburgerIcon}>☰</span>
          </button>

          <NavLink to="/dashboard" style={s.brandLink}>
            <div style={s.brandIconWrap}>
              <span>🩸</span>
            </div>
            <div style={s.brandTextWrap}>
              <span style={s.brandTitle}>LifeLink Hub</span>
              <span style={s.brandSubtitle}>Blood Donation System</span>
            </div>
          </NavLink>
        </div>

        {/* Right Side: Home Button & Status Badge */}
        <div style={s.rightSection}>
          <NavLink to="/home" style={s.homeBtn}>
            <span style={{ fontSize: 14 }}>🏠</span>
            <span style={s.homeBtnText}>Home</span>
          </NavLink>

          {/* System Live Pill */}
          <div style={s.liveBadge}>
            <span style={s.livePulseDot} />
            <span style={s.liveText}>SYSTEM LIVE</span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </header>
  )
}

/* ─── Premium Navbar Styles ──────────────────────────────────── */
const s = {
  navbar: {
    height: 60,
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  },
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  toggleBtn: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  hamburgerIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: '#ffffff',
  },
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  brandTextWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  homeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    transition: 'all 0.2s',
  },
  homeBtnText: {
    letterSpacing: '0.02em',
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    padding: '5px 12px',
    borderRadius: 20,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 8px #22c55e',
    animation: 'pulseDot 1.8s infinite ease-in-out',
  },
  liveText: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#ffffff',
  },
}
