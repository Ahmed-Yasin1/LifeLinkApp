import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import useAuth from '../hooks/useAuth'
import { getHospital } from '../api/HospitalApi'

const navigationLinks = [
  { to: '/home', label: 'Home Page', icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/donors', label: 'Donors', icon: '🩸' },
  { to: '/emergency-requests', label: 'Emergency Requests', icon: '🚨' },
  { to: '/hospitals', label: 'Hospitals', icon: '🏥' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/reports', label: 'Reports', icon: '📈' },
  { to: '/users', label: 'Users', icon: '👥' },
]

export default function Sidebar() {
  const { sidebarOpen } = useAppContext()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [hospitalProfile, setHospitalProfile] = useState(null)

  const userId = currentUser?.id || currentUser?._id
  const isHospital = currentUser?.role === 'hospital'
  const isDonor = currentUser?.role === 'donor'
  const isAdmin = currentUser?.role === 'admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!isHospital || !userId) return

    const loadHospital = async () => {
      try {
        const response = await getHospital(userId)
        const data = response?.data || response
        setHospitalProfile(data)
      } catch {
        setHospitalProfile(null)
      }
    }

    loadHospital()
  }, [isHospital, userId])

  const visibleLinks = navigationLinks.filter((link) => {
    if (isDonor) {
      return link.to === '/home' || link.to === '/notifications' || link.to === '/donors'
    }

    if (isHospital) {
      return [
        '/home',
        '/dashboard',
        '/donors',
        '/emergency-requests',
        '/inventory',
        '/notifications',
        '/reports',
      ].includes(link.to)
    }

    if (!isAdmin) {
      return link.to !== '/users'
    }

    return true
  })

  if (!sidebarOpen) {
    return null
  }

  const initial = (currentUser?.name || currentUser?.username || currentUser?.email || 'U')[0].toUpperCase()

  return (
    <aside style={s.sidebar}>
      
      {/* App Branding Header */}
      <div style={s.brandHeader}>
        <div style={s.brandIconWrap}>
          <span style={s.brandIcon}>🩸</span>
        </div>
        <div style={s.brandTextWrap}>
          <h6 style={s.brandTitle}>LifeLink Hub</h6>
          <span style={s.brandSubtitle}>Blood Operations</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={s.navGroup}>
        <div style={s.menuLabel}>MAIN MENU</div>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navItemActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ ...s.navIcon, transform: isActive ? 'scale(1.15)' : 'none' }}>
                  {link.icon}
                </span>
                <span style={s.navLabel}>{link.label}</span>
                {isActive && <span style={s.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout Card */}
      <div style={s.userCard}>
        <div style={s.userRow}>
          <div style={s.avatarCircle}>
            {initial}
          </div>
          <div style={s.userInfo}>
            <div style={s.userName} title={currentUser?.name || currentUser?.email}>
              {currentUser?.name || currentUser?.username || currentUser?.email || 'User'}
            </div>
            <span style={{
              ...s.roleBadge,
              background: isAdmin ? '#fee2e2' : isHospital ? '#dbeafe' : '#d1fae5',
              color: isAdmin ? '#b91c1c' : isHospital ? '#1e40af' : '#065f46',
            }}>
              {currentUser?.role?.toUpperCase() || 'USER'}
            </span>
          </div>
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>

      <style>{`
        .sidebar-item-hover:hover {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
          transform: translateX(4px);
        }
      `}</style>
    </aside>
  )
}

/* ─── Premium Sidebar Styles ─────────────────────────────────── */
const s = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    minHeight: 'calc(100vh - 56px)',
    background: '#ffffff',
    borderRight: '1px solid #f0f0f0',
    boxShadow: '4px 0 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '24px 16px 20px',
    boxSizing: 'border-box',
    userSelect: 'none',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    padding: '0 8px',
  },
  brandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
  },
  brandIcon: {
    fontSize: 22,
  },
  brandTextWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.08em',
    margin: '0 8px 8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 12,
    color: '#4b5563',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    background: 'transparent',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(220,38,38,0.3)',
  },
  navIcon: {
    fontSize: 18,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  navLabel: {
    flex: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 0 6px rgba(255,255,255,0.8)',
  },
  userCard: {
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 10,
    letterSpacing: '0.04em',
    width: 'fit-content',
  },
  logoutBtn: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 10,
    border: '1.5px solid #fee2e2',
    background: '#ffffff',
    color: '#dc2626',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
  },
}
