import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { createEmergency, deleteEmergency, getEmergencies, updateEmergencyStatus } from '../api/EmergencyApi'
import { getHospitals } from '../api/HospitalApi'
import { DISTRICTS } from '../constants/districts'

const initialForm = {
  hospital: '',
  bloodType: 'O+',
  unitsRequired: '',
  urgency: 'Medium',
  location: '',
  contactPerson: '',
  phone: ''
}

export default function EmergencyRequests() {
  const { user } = useAuth()
  const isHospital = user?.role === 'hospital'

  const [requests, setRequests] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    try {
      setLoading(true)
      const [emergencyResponse, hospitalResponse] = await Promise.all([getEmergencies(), getHospitals()])
      setRequests(Array.isArray(emergencyResponse?.data?.data) ? emergencyResponse.data.data : [])
      setHospitals(Array.isArray(hospitalResponse?.data) ? hospitalResponse.data : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load emergency requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    if (isHospital) {
      setForm((prev) => ({ ...prev, hospital: user?.id || user?._id }))
    }
  }, [isHospital, user?.id, user?._id])

  const resetForm = () => {
    setForm(initialForm)
    if (isHospital) {
      setForm((prev) => ({ ...prev, hospital: user.id }))
    }
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createEmergency({
        ...form,
        unitsRequired: Number(form.unitsRequired),
        hospital: isHospital ? (user?.id || user?._id) : form.hospital,
      })
      await loadData()
      resetForm()
    } catch (err) {
      setError(err.message || 'Unable to create emergency request')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateEmergencyStatus(id, status)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this emergency request?')) return

    try {
      await deleteEmergency(id)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to delete emergency request')
    }
  }

  const pendingCount    = requests.filter((item) => item.status === 'Pending').length
  const inProgressCount = requests.filter((item) => item.status === 'Searching' || item.status === 'Matched').length
  const completedCount  = requests.filter((item) => item.status === 'Completed').length

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return '#dc2626'; // red
      case 'High': return '#ea580c'; // orange
      case 'Medium': return '#2563eb'; // blue
      case 'Low': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#eab308'; // yellow
      case 'Searching': return '#3b82f6'; // blue
      case 'Matched': return '#a855f7'; // purple
      case 'Completed': return '#22c55e'; // green
      case 'Cancelled': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  }

  const getBloodTypeColor = (type) => {
    if (type?.includes('O')) return '#10b981'; // green
    if (type?.includes('A') && !type?.includes('B')) return '#ef4444'; // red
    if (type?.includes('B') && !type?.includes('A')) return '#3b82f6'; // blue
    if (type?.includes('AB')) return '#8b5cf6'; // purple
    return '#6366f1';
  }

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin-animation {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>🚨 Emergency Requests</h1>
        <button 
          style={styles.addButton} 
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsContainer}>
        <div style={{...styles.statCard, ...styles.statCardRed}}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Pending</div>
            <div style={styles.statValue}>{pendingCount}</div>
          </div>
        </div>
        <div style={{...styles.statCard, ...styles.statCardOrange}}>
          <div style={styles.statIcon}>🔍</div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>In Progress</div>
            <div style={styles.statValue}>{inProgressCount}</div>
          </div>
        </div>
        <div style={{...styles.statCard, ...styles.statCardGreen}}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Completed</div>
            <div style={styles.statValue}>{completedCount}</div>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Collapsible Form */}
      {showForm && (
        <div style={styles.formPanel}>
          <h3 style={styles.formTitle}>Create New Emergency Request</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              {isHospital ? (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hospital</label>
                  <input
                    style={{...styles.input, backgroundColor: '#f3f4f6'}}
                    value={hospitals.find((hospital) => hospital._id === user.id)?.name || 'Your Hospital'}
                    disabled
                  />
                </div>
              ) : (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hospital</label>
                  <select style={styles.input} name="hospital" value={form.hospital} onChange={handleChange} required>
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Type</label>
                <select style={styles.input} name="bloodType" value={form.bloodType} onChange={handleChange}>
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Units Required</label>
                <input style={styles.input} type="number" name="unitsRequired" value={form.unitsRequired} onChange={handleChange} required min="1"/>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Urgency</label>
                <select style={styles.input} name="urgency" value={form.urgency} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target District </label>
                <select style={styles.input} name="location" value={form.location} onChange={handleChange} required>
                  <option value="">Select target district</option>
                  <option value="All Districts">All Districts </option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Person</label>
                <input style={styles.input} name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Name" required/>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" required/>
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.saveButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save Request'}
              </button>
              <button type="button" style={styles.cancelButton} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="spin-animation" style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading requests...</p>
        </div>
      ) : (
        <div style={styles.requestsContainer}>
          {requests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🚑</div>
              <h3 style={styles.emptyText}>No emergency requests found</h3>
              <p style={styles.emptySubText}>There are currently no active blood requests.</p>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {requests.map((item) => (
                <div key={item._id} style={{...styles.requestCard, borderLeft: `6px solid ${getUrgencyColor(item.urgency)}`}}>
                  <div style={{...styles.bloodBadge, backgroundColor: getBloodTypeColor(item.bloodType)}}>
                    {item.bloodType}
                  </div>
                  
                  <div style={styles.cardDetails}>
                    <h4 style={styles.hospitalName}>
                      {item.hospital?.name || item.hospital?.username || item.hospital?.email || item.hospital || 'Unknown Hospital'}
                    </h4>
                    <div style={styles.cardMeta}>
                      <span style={styles.metaItem}>🩸 {item.unitsRequired} Units Required</span>
                      <span style={styles.metaItem}>📍 {[item.hospital?.district, item.hospital?.address].filter(Boolean).join(', ') || item.location || 'Location N/A'}</span>
                    </div>
                    {(item.contactPerson || item.phone) && (
                      <div style={styles.contactInfo}>
                        📞 {item.contactPerson} {item.phone && `(${item.phone})`}
                      </div>
                    )}
                    <div style={styles.badgesContainer}>
                      <span style={{...styles.pillBadge, backgroundColor: `${getUrgencyColor(item.urgency)}20`, color: getUrgencyColor(item.urgency)}}>
                        {item.urgency} Priority
                      </span>
                      <span style={{...styles.pillBadge, backgroundColor: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status)}}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.cardActions}>
                    <select
                      style={styles.statusSelect}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Searching">Searching</option>
                      <option value="Matched">Matched</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button style={{...styles.actionButton, color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2'}} onClick={() => handleDelete(item._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const hospitalStatusStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  btnRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  btn: {
    fontSize: 12,
    padding: '5px 11px',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.18s',
    outline: 'none',
  },
}

const styles = {
  pageContainer: {
    padding: '2rem',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  addButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3), 0 2px 4px -1px rgba(220, 38, 38, 0.2)',
    transition: 'all 0.2s',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    color: 'white',
  },
  statCardRed: {
    background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
  },
  statCardOrange: {
    background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
  },
  statCardGreen: {
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  },
  statIcon: {
    fontSize: '3rem',
    marginRight: '1rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    opacity: 0.9,
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    lineHeight: 1.1,
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    borderLeft: '4px solid #dc2626',
  },
  formPanel: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    marginBottom: '2rem',
    border: '1px solid #e5e7eb',
  },
  formTitle: {
    marginTop: 0,
    marginBottom: '1.5rem',
    fontSize: '1.25rem',
    color: '#1f2937',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  formGroup: {
    flex: '1 1 min-content',
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  saveButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #dc2626',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px dashed #d1d5db',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.5rem',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  emptySubText: {
    color: '#6b7280',
    margin: 0,
  },
  requestsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
  },
  bloodBadge: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: '700',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  cardDetails: {
    flex: 1,
    minWidth: '250px',
  },
  hospitalName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    color: '#111827',
    fontWeight: '700',
  },
  cardMeta: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '0.5rem',
    color: '#4b5563',
    fontSize: '0.95rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
  },
  contactInfo: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
  },
  badgesContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pillBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: '150px',
  },
  statusSelect: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f9fafb',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    outline: 'none',
  },
  actionButton: {
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderWidth: '1px',
    borderStyle: 'solid',
  }
}
