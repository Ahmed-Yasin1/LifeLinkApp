import { useEffect, useState } from 'react'
import {
  getNotifications,
  getAllNotifications,
  getHospitalSentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markAllHospitalNotificationsRead,
  deleteNotification,
} from '../api/NotificationApi'
import useAuth from '../hooks/useAuth'

const typeConfig = {
  emergency: { icon: '🚨', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Emergency' },
  donation:  { icon: '🩸', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Donation' },
  info:      { icon: 'ℹ️',  color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Info' },
  alert:     { icon: '⚠️', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Alert' },
  default:   { icon: '🔔', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'Notification' },
}

function getTypeConfig(n) {
  const t = (n.type || '').toLowerCase()
  if (t.includes('emergency')) return typeConfig.emergency
  if (t.includes('donat'))     return typeConfig.donation
  if (t.includes('alert'))     return typeConfig.alert
  if (t.includes('info'))      return typeConfig.info
  return typeConfig.default
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function Notifications() {
  const { user, isLoading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [deletingId, setDeletingId]       = useState(null)
  const [filter, setFilter]               = useState('all')

  const isAdmin    = user?.role === 'admin'
  const isHospital = user?.role === 'hospital'

  const load = async (retries = 1) => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      let res
      if (isAdmin)         res = await getAllNotifications()
      else if (isHospital) res = await getHospitalSentNotifications()
      else                 res = await getNotifications(user.donorId || user.id)
      setNotifications(res.data?.data || [])
    } catch (err) {
      const status = err.response?.status
      // Retry once on 403 — likely a token-not-yet-ready race condition
      if (status === 403 && retries > 0) {
        setTimeout(() => load(retries - 1), 1000)
        return
      }
      setError(err.response?.data?.message || err.message || 'Unable to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Only load once auth has fully resolved (avoids 403 race on page load)
  useEffect(() => {
    if (!authLoading && user) load()
  }, [authLoading, user])

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    load()
  }

  const handleMarkAllRead = async () => {
    if (isHospital) await markAllHospitalNotificationsRead()
    else            await markAllNotificationsRead(isAdmin ? 'all' : (user.donorId || user.id))
    load()
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    await deleteNotification(id)
    setDeletingId(null)
    load()
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read')   return n.isRead
    return true
  })

  if (!user) {
    return (
      <div style={styles.empty}>
        <span style={{ fontSize: 48 }}>🔔</span>
        <p style={{ color: '#6b7280', marginTop: 12 }}>Please sign in to view notifications.</p>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount} new</span>
            )}
          </h1>
          <p style={styles.subtitle}>
            {isAdmin ? 'All system notifications' : isHospital ? 'Track recipient readers, blood types, and read status' : 'Your personal notifications'}
          </p>
        </div>

        <div style={styles.headerActions}>
          {/* Filter tabs */}
          <div style={styles.filterRow}>
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span style={styles.filterCount}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {unreadCount > 0 && (
              <button style={styles.btnSecondary} onClick={handleMarkAllRead}>
                ✓ Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={{ color: '#9ca3af', marginTop: 16 }}>Loading notifications…</p>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 56 }}>📭</span>
          <p style={{ color: '#6b7280', marginTop: 12, fontSize: 16 }}>
            {filter === 'unread' ? 'No unread notifications.' : filter === 'read' ? 'No read notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((n) => {
            const cfg      = getTypeConfig(n)
            const isDeleting = deletingId === n._id
            const hospital = n.sender?.name || n.relatedEmergency?.hospital?.name
              || n.relatedEmergency?.hospital?.username || n.relatedEmergency?.hospital?.email

            return (
              <div
                key={n._id}
                style={{
                  ...styles.card,
                  borderLeft: `4px solid ${cfg.border}`,
                  background: n.isRead ? '#fff' : cfg.bg,
                  opacity: isDeleting ? 0.4 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {/* Left: icon */}
                <div style={{ ...styles.iconWrap, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
                  <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                </div>

                {/* Middle: content */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTopRow}>
                    <span style={{ ...styles.typeTag, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                    {!n.isRead && <span style={styles.unreadDot} title="Unread" />}
                    <span style={styles.timeLabel}>{timeAgo(n.createdAt)}</span>
                  </div>

                  <h3 style={styles.cardTitle}>{n.title || 'Notification'}</h3>
                  <p style={styles.cardMsg}>{n.message}</p>

                  {/* Blood Type Info */}
                  {(n.relatedEmergency?.bloodType || n.recipient?.bloodGroup) && (
                    <div style={styles.pill}>
                      🩸 Blood Type: <strong>{n.relatedEmergency?.bloodType || n.recipient?.bloodGroup}</strong>
                    </div>
                  )}

                  {/* Reader / Recipient Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                    {(n.recipient) && (
                      <div style={styles.metaLine}>
                        👤 <strong>Donor:</strong> 
                        <span style={{ fontWeight: 600, color: '#111827' }}>
                          {n.recipient?.fullName || n.recipient?.name || n.recipient?.username || n.recipient?.email || '—'}
                        </span>
                      </div>
                    )}
                    {hospital && (
                      <div style={styles.metaLine}>
                        🏥 <strong>Hospital:</strong> <span>{hospital}</span>
                      </div>
                    )}
                    {/* Hospital location */}
                    {(() => {
                      const h = n.relatedEmergency?.hospital
                      const loc = h ? [h.district, h.address].filter(Boolean).join(', ') : null
                      return loc ? (
                        <div style={styles.metaLine}>
                          📍 <strong>Hospital Location:</strong> <span>{loc}</span>
                        </div>
                      ) : null
                    })()}
                    <div style={styles.metaLine}>
                      📖 <strong>Read Status:</strong> 
                      <span style={{
                        fontWeight: 600,
                        color: n.isRead ? '#16a34a' : '#dc2626',
                        background: n.isRead ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${n.isRead ? '#86efac' : '#fca5a5'}`,
                        borderRadius: 12,
                        padding: '1px 8px',
                        fontSize: 12,
                      }}>
                        {n.isRead ? `✓ Read` : `⏳ Unread`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div style={styles.cardActions}>
                  <span style={{ ...styles.readBadge, ...(n.isRead ? styles.readBadgeRead : styles.readBadgeUnread) }}>
                    {n.isRead ? '✓ Read' : '● Unread'}
                  </span>
                  {!n.isRead && (
                    <button
                      style={styles.btnMark}
                      onClick={() => handleMarkRead(n._id)}
                      title="Mark as read"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    style={styles.btnDelete}
                    onClick={() => handleDelete(n._id)}
                    disabled={isDeleting}
                    title="Delete notification"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

/* ─── Styles ─────────────────────────────────────────────────────── */
const styles = {
  page: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '8px 0 40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#fff',
    borderRadius: 20,
    padding: '2px 12px',
    fontSize: 13,
    fontWeight: 600,
    animation: 'pulse 2s infinite',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
  },
  filterRow: {
    display: 'flex',
    gap: 4,
    background: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
  },
  filterBtn: {
    border: 'none',
    background: 'transparent',
    borderRadius: 8,
    padding: '5px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: '#fff',
    color: '#dc2626',
    fontWeight: 700,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  filterCount: {
    background: '#dc2626',
    color: '#fff',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 11,
    fontWeight: 700,
  },
  btnSecondary: {
    border: '1.5px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  typeTag: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: 20,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#dc2626',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  timeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px',
  },
  cardMsg: {
    fontSize: 14,
    color: '#4b5563',
    margin: '0 0 8px',
    lineHeight: 1.55,
  },
  pill: {
    display: 'inline-block',
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    borderRadius: 20,
    padding: '3px 12px',
    fontSize: 13,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 13,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  readBadge: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    padding: '3px 10px',
    whiteSpace: 'nowrap',
  },
  readBadgeRead: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #86efac',
  },
  readBadgeUnread: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
  },
  btnMark: {
    background: '#fff',
    border: '1.5px solid #d1d5db',
    color: '#374151',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDelete: {
    background: '#fff',
    border: '1.5px solid #fca5a5',
    color: '#dc2626',
    borderRadius: 8,
    padding: '5px 10px',
    fontSize: 15,
    cursor: 'pointer',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
    textAlign: 'center',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
}
