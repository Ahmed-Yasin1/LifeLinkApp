import { useEffect, useMemo, useState } from 'react'
import { createHospital, deleteHospital, getHospitals, updateHospital } from '../api/HospitalApi'
import { DISTRICTS } from '../constants/districts'

const initialForm = {
  name: '',
  district: '',
  address: '',
  phone: '',
  email: '',
  password: '',
  status: 'Active'
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHospital, setEditingHospital] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHospitals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return hospitals

    return hospitals.filter((hospital) => String(hospital.name || '').toLowerCase().includes(query))
  }, [hospitals, searchTerm])

  const loadHospitals = async () => {
    try {
      setLoading(true)
      const response = await getHospitals()
      setHospitals(Array.isArray(response?.data) ? response.data : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load hospitals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHospitals()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingHospital(null)
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
      if (editingHospital) {
        await updateHospital(editingHospital._id, form)
      } else {
        await createHospital(form)
      }

      await loadHospitals()
      resetForm()
    } catch (err) {
      setError(err.message || 'Unable to save hospital')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (hospital) => {
    setEditingHospital(hospital)
    setForm({
      name: hospital.name || '',
      district: hospital.district || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      email: hospital.email || '',
      status: hospital.status || 'Active'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hospital?')) return

    try {
      await deleteHospital(id)
      await loadHospitals()
    } catch (err) {
      setError(err.message || 'Unable to delete hospital')
    }
  }

  // Styles object
  const styles = {
    container: {
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      color: '#1f2937'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    addBtn: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
      transition: 'all 0.2s ease'
    },
    cancelBtn: {
      background: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      borderRadius: '16px',
      padding: '1.5rem',
      color: 'white',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    blueGradient: {
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)'
    },
    greenGradient: {
      background: 'linear-gradient(135deg, #16a34a, #15803d)'
    },
    orangeGradient: {
      background: 'linear-gradient(135deg, #d97706, #b45309)'
    },
    statNumber: {
      fontSize: '36px',
      fontWeight: 'bold',
      margin: '0 0 0.25rem 0',
      lineHeight: 1
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0
    },
    statIcon: {
      fontSize: '32px',
      opacity: 0.8
    },
    filterCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #f3f4f6'
    },
    searchIcon: {
      marginRight: '10px',
      color: '#9ca3af'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      width: '100%',
      fontSize: '16px',
      color: '#4b5563'
    },
    formPanel: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
      border: '1px solid #f3f4f6'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: '#6b7280',
      letterSpacing: '0.05em'
    },
    input: {
      border: '1.5px solid #e5e7eb',
      borderRadius: '8px',
      padding: '9px 12px',
      backgroundColor: '#f9fafb',
      fontSize: '14px',
      outline: 'none',
      color: '#1f2937',
      transition: 'border-color 0.2s'
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1rem'
    },
    saveBtn: {
      background: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '10px 24px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
    },
    hospitalGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    iconCircle: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    hospitalName: {
      fontSize: '17px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    badgeContainer: {
      marginTop: '0.25rem'
    },
    badge: (status) => {
      const colors = {
        Active: { bg: '#dcfce7', text: '#166534' },
        Pending: { bg: '#fef08a', text: '#854d0e' },
        Inactive: { bg: '#f3f4f6', text: '#374151' }
      }
      const c = colors[status] || colors.Active
      return {
        backgroundColor: c.bg,
        color: c.text,
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block'
      }
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '14px',
      color: '#4b5563'
    },
    cardActions: {
      display: 'flex',
      gap: '0.75rem',
      marginTop: 'auto',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6'
    },
    editBtn: {
      flex: 1,
      backgroundColor: 'transparent',
      color: '#2563eb',
      border: '1px solid #2563eb',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px'
    },
    deleteBtn: {
      flex: 1,
      backgroundColor: 'transparent',
      color: '#dc2626',
      border: '1px solid #dc2626',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px'
    },
    spinnerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTopColor: '#dc2626',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      color: '#6b7280',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px dashed #d1d5db'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '1rem',
      opacity: 0.5
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      border: '1px solid #f87171',
      color: '#991b1b',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      fontWeight: '500'
    }
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .hospital-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .search-input::placeholder {
            color: #9ca3af;
          }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>🏥 Hospital Directory</h1>
        <button style={styles.addBtn} onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? 'Cancel' : 'Add Hospital'}
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, ...styles.blueGradient}}>
          <div>
            <p style={styles.statNumber}>{hospitals.length}</p>
            <p style={styles.statLabel}>Partner Hospitals</p>
          </div>
          <div style={styles.statIcon}>🏥</div>
        </div>
        <div style={{...styles.statCard, ...styles.greenGradient}}>
          <div>
            <p style={styles.statNumber}>{hospitals.filter((item) => item.status === 'Active').length}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
          <div style={styles.statIcon}>✅</div>
        </div>
        <div style={{...styles.statCard, ...styles.orangeGradient}}>
          <div>
            <p style={styles.statNumber}>{hospitals.filter((item) => item.status !== 'Active').length}</p>
            <p style={styles.statLabel}>Pending/Inactive</p>
          </div>
          <div style={styles.statIcon}>⏳</div>
        </div>
      </div>

      <div style={styles.filterCard}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search hospitals by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showForm && (
        <div style={styles.formPanel}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input style={styles.input} name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>District</label>
                <select style={styles.input} name="district" value={form.district} onChange={handleChange} required>
                  <option value="">Select district</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select style={styles.input} name="status" value={form.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={styles.formActions}>
              <button style={styles.saveBtn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingHospital ? 'Update Hospital' : 'Save Hospital'}
              </button>
              <button style={styles.cancelBtn} type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏥</div>
          <h3>No hospitals found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div style={styles.hospitalGrid}>
          {filteredHospitals.map((hospital) => (
            <div key={hospital._id} style={styles.card} className="hospital-card">
              <div style={styles.cardHeader}>
                <div style={styles.iconCircle}>🏥</div>
                <div>
                  <h3 style={styles.hospitalName}>{hospital.name}</h3>
                  <div style={styles.badgeContainer}>
                    <span style={styles.badge(hospital.status || 'Active')}>
                      {hospital.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={styles.infoRow}>
                  <span>📍</span>
                  <span>{hospital.district || hospital.location}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>📞</span>
                  <span>{hospital.phone}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>✉️</span>
                  <span>{hospital.email}</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button style={styles.editBtn} onClick={() => handleEdit(hospital)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(hospital._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
