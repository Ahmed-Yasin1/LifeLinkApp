import { useState, useEffect } from 'react'
import apiClient from '../api/ApiClient'
import useAuth from '../hooks/useAuth'

const BLOOD_COLORS = {
  'A+':  '#dc2626', 'A-':  '#b91c1c',
  'B+':  '#2563eb', 'B-':  '#1d4ed8',
  'AB+': '#7c3aed', 'AB-': '#6d28d9',
  'O+':  '#16a34a', 'O-':  '#15803d',
}

const statusColors = {
  Pending:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Approved:  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  Fulfilled: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  Rejected:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
}

function StatCard({ icon, label, value, gradient, sub }) {
  return (
    <div style={{ ...styles.statCard, background: gradient }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <div style={styles.statValue}>{value ?? 0}</div>
        <div style={styles.statLabel}>{label}</div>
        {sub && <div style={styles.statSub}>{sub}</div>}
      </div>
    </div>
  )
}

function BloodBar({ group, units, maxUnits }) {
  const pct   = maxUnits > 0 ? Math.round((units / maxUnits) * 100) : 0
  const color = BLOOD_COLORS[group] || '#dc2626'
  const low   = units < 5
  return (
    <div style={styles.barRow}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...styles.bloodDot, background: color }} />
          <span style={styles.barLabel}>{group}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={styles.barUnits}>{units} units</span>
          <span style={{
            ...styles.stockBadge,
            background: low ? '#fef2f2' : '#f0fdf4',
            color:      low ? '#dc2626' : '#16a34a',
            border:     `1px solid ${low ? '#fca5a5' : '#86efac'}`,
          }}>
            {low ? '⚠ Low' : '✓ OK'}
          </span>
        </div>
      </div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Reports() {
  const { user } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [startDate, setStart]   = useState('')
  const [endDate, setEnd]       = useState('')

  const load = async (from = '', to = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        startDate: from || undefined,
        endDate:   to   || undefined,
      }
      if (user?.role === 'hospital') params.hospitalId = user.id
      const res = await apiClient.get('/reports', { params })
      setData(res?.data?.data || res?.data || null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) load() }, [user])

  const handleFilter = (e) => {
    e.preventDefault()
    load(startDate, endDate)
  }

  const handleReset = () => {
    setStart('')
    setEnd('')
    load()
  }

  const maxUnits = data?.bloodGroupStats
    ? Math.max(...data.bloodGroupStats.map((g) => g.units), 1)
    : 1

  return (
    <div style={styles.page}>

      {/* ── Page Header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>📊 Reports & Analytics</h1>
          <p style={styles.pageSubtitle}>
            Blood donation metrics, inventory levels, and emergency request overview
          </p>
        </div>
        {data?.generatedAt && (
          <div style={styles.generatedAt}>
            🕐 Updated {timeAgo(data.generatedAt)}
          </div>
        )}
      </div>

      {/* ── Date Filter ── */}
      <div style={styles.filterCard}>
        <form onSubmit={handleFilter} style={styles.filterForm}>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>📅 Start Date</label>
            <input
              style={styles.filterInput}
              type="date"
              value={startDate}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div style={styles.filterField}>
            <label style={styles.filterLabel}>📅 End Date</label>
            <input
              style={styles.filterInput}
              type="date"
              value={endDate}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
            <button type="submit" style={styles.btnFilter}>Apply Filter</button>
            {(startDate || endDate) && (
              <button type="button" style={styles.btnReset} onClick={handleReset}>Reset</button>
            )}
          </div>
        </form>
      </div>

      {/* ── Loading / Error ── */}
      {loading && (
        <div style={styles.centerBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#9ca3af', marginTop: 16 }}>Loading reports…</p>
        </div>
      )}
      {!loading && error && (
        <div style={styles.errorBox}>⚠️ {error}</div>
      )}

      {!loading && !error && data && (
        <>
          {/* ── Stat Cards ── */}
          <div style={styles.statsGrid}>
            <StatCard
              icon="🩸"
              label="Total Donors"
              value={data.totalDonors}
              gradient="linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
              sub="Registered donors"
            />
            <StatCard
              icon="🏥"
              label="Total Hospitals"
              value={data.totalHospitals}
              gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
              sub="Active hospitals"
            />
            <StatCard
              icon="📦"
              label="Blood Units"
              value={data.totalUnits}
              gradient="linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
              sub="In inventory"
            />
            <StatCard
              icon="🚨"
              label="Total Requests"
              value={data.totalRequests}
              gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
              sub={`${data.pendingRequests ?? 0} pending`}
            />
          </div>

          {/* ── Two-column layout ── */}
          <div style={styles.twoCol}>

            {/* Blood Group Distribution */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>🩸 Blood Group Distribution</h2>
                <span style={styles.cardCount}>{data.bloodGroupStats?.length ?? 0} types</span>
              </div>

              {data.bloodGroupStats?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {data.bloodGroupStats
                    .sort((a, b) => b.units - a.units)
                    .map((g) => (
                      <BloodBar key={g.bloodGroup} group={g.bloodGroup} units={g.units} maxUnits={maxUnits} />
                    ))}
                </div>
              ) : (
                <div style={styles.emptyBox}>
                  <span style={{ fontSize: 40 }}>📭</span>
                  <p style={{ color: '#9ca3af', marginTop: 8 }}>No inventory data available.</p>
                </div>
              )}
            </div>

            {/* Recent Emergency Requests */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>🚨 Recent Emergencies</h2>
                <span style={styles.cardCount}>{data.recentRequests?.length ?? 0} requests</span>
              </div>

              {data.recentRequests?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.recentRequests.map((req) => {
                    const sc = statusColors[req.status] || statusColors.Pending
                    return (
                      <div key={req._id} style={styles.reqCard}>
                        <div style={styles.reqLeft}>
                          <div style={{ ...styles.bloodTypeBadge, background: BLOOD_COLORS[req.bloodType] || '#dc2626' }}>
                            {req.bloodType}
                          </div>
                        </div>
                        <div style={styles.reqBody}>
                          <div style={styles.reqTop}>
                            <span style={styles.reqHospital}>
                              🏥 {req.hospital?.name || req.hospital?.username || req.hospital?.email || 'Unknown'}
                            </span>
                            <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              {req.status}
                            </span>
                          </div>
                          <div style={styles.reqMeta}>
                            <span>💉 {req.unitsRequired} units required</span>
                            <span style={{ color: '#9ca3af' }}>• {timeAgo(req.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={styles.emptyBox}>
                  <span style={{ fontSize: 40 }}>✅</span>
                  <p style={{ color: '#9ca3af', marginTop: 8 }}>No emergency requests.</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Inventory Detail Table ── */}
          {data.inventoryDetails?.length > 0 && (
            <div style={{ ...styles.card, marginTop: 24 }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>📦 Inventory Details</h2>
                <span style={styles.cardCount}>{data.inventoryDetails.length} items</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Blood Type</th>
                      <th style={styles.th}>Units</th>
                      <th style={styles.th}>Hospital</th>
                      <th style={styles.th}>Expiry</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.inventoryDetails.map((item, i) => {
                      const expiry    = item.expiryDate ? new Date(item.expiryDate) : null
                      const isExpiring = expiry && (expiry - Date.now()) < 30 * 24 * 3600 * 1000
                      const isExpired  = expiry && expiry < Date.now()
                      return (
                        <tr key={item._id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={styles.td}>
                            <span style={{ ...styles.bloodTypeBadge, background: BLOOD_COLORS[item.bloodType] || '#dc2626', fontSize: 13 }}>
                              {item.bloodType}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700 }}>{item.quantity} units</td>
                          <td style={styles.td}>{item.hospital?.name || item.hospital?.username || '—'}</td>
                          <td style={styles.td}>
                            {expiry ? expiry.toLocaleDateString() : '—'}
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.stockBadge,
                              background: isExpired ? '#fef2f2' : isExpiring ? '#fffbeb' : '#f0fdf4',
                              color:      isExpired ? '#dc2626' : isExpiring ? '#d97706' : '#16a34a',
                              border:     `1px solid ${isExpired ? '#fca5a5' : isExpiring ? '#fcd34d' : '#86efac'}`,
                            }}>
                              {isExpired ? '❌ Expired' : isExpiring ? '⚠ Expiring' : '✓ Good'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Registered Hospitals Table (Admin only) ── */}
          {user?.role !== 'hospital' && (
            <div style={{ ...styles.card, marginTop: 24 }}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>🏥 Registered Partner Hospitals</h2>
                <span style={styles.cardCount}>{data.hospitalsList?.length ?? 0} hospitals</span>
              </div>

              {data.hospitalsList?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.thead}>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>Hospital Name</th>
                        <th style={styles.th}>District</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hospitalsList.map((h, i) => {
                        const statusMap = {
                          active:    { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'Active' },
                          inactive:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Inactive' },
                          suspended: { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Suspended' },
                        }
                        const s = statusMap[h.status?.toLowerCase()] || statusMap.active
                        return (
                          <tr key={h._id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={styles.td}>
                              <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                                {i + 1}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 18 }}>🏥</span>
                                <span style={{ fontWeight: 600, color: '#111827' }}>{h.name || '—'}</span>
                              </div>
                            </td>
                            <td style={styles.td}><span style={{ color: '#6b7280' }}>📍 {h.district || h.address || '—'}</span></td>
                            <td style={styles.td}><span style={{ color: '#374151' }}>📞 {h.phone || '—'}</span></td>
                            <td style={styles.td}><span style={{ color: '#374151' }}>✉️ {h.email || '—'}</span></td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.stockBadge,
                                background: s.bg,
                                color: s.color,
                                border: `1px solid ${s.border}`,
                              }}>
                                {s.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.emptyBox}>
                  <span style={{ fontSize: 40 }}>🏥</span>
                  <p style={{ color: '#9ca3af', marginTop: 8 }}>No hospitals registered yet.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fillBar { from { width: 0; } }
      `}</style>
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '8px 4px 48px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#111827',
    margin: 0,
  },
  pageSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    margin: '4px 0 0',
  },
  generatedAt: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 13,
    color: '#6b7280',
  },
  filterCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  filterForm: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterInput: {
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    background: '#f9fafb',
  },
  btnFilter: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnReset: {
    background: '#fff',
    color: '#6b7280',
    border: '1.5px solid #d1d5db',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 16,
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    color: '#fff',
  },
  statIcon: {
    fontSize: 36,
    flexShrink: 0,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1,
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  cardCount: {
    background: '#f3f4f6',
    color: '#6b7280',
    borderRadius: 20,
    padding: '3px 12px',
    fontSize: 12,
    fontWeight: 600,
  },
  barRow: {
    padding: '4px 0',
  },
  barLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
  },
  barUnits: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 500,
  },
  bloodDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  barTrack: {
    height: 10,
    background: '#f3f4f6',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.8s ease',
    animation: 'fillBar 0.8s ease',
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: 20,
  },
  reqCard: {
    display: 'flex',
    gap: 12,
    background: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: 12,
    padding: '12px 14px',
    alignItems: 'center',
  },
  reqLeft: {
    flexShrink: 0,
  },
  bloodTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    color: '#fff',
    fontWeight: 800,
    fontSize: 14,
  },
  reqBody: {
    flex: 1,
    minWidth: 0,
  },
  reqTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  reqHospital: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 9px',
    borderRadius: 20,
  },
  reqMeta: {
    fontSize: 12,
    color: '#6b7280',
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  thead: {
    background: '#f9fafb',
  },
  th: {
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '2px solid #e5e7eb',
  },
  td: {
    padding: '12px 14px',
    color: '#374151',
    verticalAlign: 'middle',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: 44,
    height: 44,
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    borderRadius: 12,
    padding: '16px 20px',
    fontSize: 14,
    fontWeight: 500,
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0',
    color: '#9ca3af',
    textAlign: 'center',
  },
}