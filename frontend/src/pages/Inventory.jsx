import { useEffect, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { addBlood, deleteInventory, getInventory, updateInventory } from '../api/InventoryApi'
import { getHospitals } from '../api/HospitalApi'

const initialForm = {
  hospital: '',
  bloodType: 'O+',
  quantity: '',
  expiryDate: ''
}

export default function Inventory() {
  const { user } = useAuth()
  const isHospital = user?.role === 'hospital'

  const [inventory, setInventory] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [searchTerm, setSearchTerm] = useState('')
  const [hospitalFilter, setHospitalFilter] = useState('')

  const filteredInventory = useMemo(() => {
    const query = searchTerm.trim().toUpperCase()

    return inventory.filter((item) => {
      const matchesBloodType = !query || item.bloodType?.toUpperCase().includes(query)
      const matchesHospital = !hospitalFilter || String(item.hospital?._id || item.hospital || '').toLowerCase() === hospitalFilter.toLowerCase()

      return matchesBloodType && matchesHospital
    })
  }, [inventory, searchTerm, hospitalFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const inventoryResponse = await getInventory()
      const hospitalsResponse = await getHospitals()

      const inventoryData = Array.isArray(inventoryResponse?.data)
        ? inventoryResponse.data
        : inventoryResponse?.data?.blood || []

      const hospitalData = Array.isArray(hospitalsResponse?.data)
        ? hospitalsResponse.data
        : []

      setInventory(inventoryData)
      setHospitals(hospitalData)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const userId = user?.id || user?._id

  useEffect(() => {
    if (isHospital && userId) {
      setForm((prev) => ({ ...prev, hospital: userId }))
    }
  }, [isHospital, userId])

  const resetForm = () => {
    setForm(initialForm)
    if (isHospital && userId) {
      setForm((prev) => ({ ...prev, hospital: userId }))
    }
    setEditingItem(null)
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

    const targetHospital = isHospital 
      ? userId 
      : (form.hospital || (typeof editingItem?.hospital === 'object' ? editingItem.hospital?._id : editingItem?.hospital))

    if (!targetHospital || !form.quantity || !form.expiryDate) {
      setError('Please complete all fields')
      setSaving(false)
      return
    }

    try {
      const payload = {
        hospital: targetHospital,
        bloodType: form.bloodType.toUpperCase(),
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate
      }

      if (editingItem) {
        await updateInventory(editingItem._id, payload)
      } else {
        await addBlood(payload)
      }

      await loadData()
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save inventory item')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    const hId = typeof item.hospital === 'object' ? (item.hospital?._id || '') : (item.hospital || '')
    setForm({
      hospital: hId || (isHospital ? userId : ''),
      bloodType: item.bloodType || 'O+',
      quantity: item.quantity || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return

    try {
      await deleteInventory(id)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to delete inventory item')
    }
  }

  const totalUnits = filteredInventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const lowStockCount = filteredInventory.filter((item) => Number(item.quantity || 0) <= 50).length

  const expiringSoonCount = filteredInventory.filter((item) => {
    if (!item.expiryDate) return false
    const days = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    return days > 0 && days <= 30
  }).length

  const expiredCount = filteredInventory.filter((item) => {
    if (!item.expiryDate) return false
    const days = (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    return days <= 0
  }).length

  const getBloodTypeColor = (type) => {
    switch (type) {
      case 'O+': return '#22c55e'
      case 'O-': return '#166534'
      case 'A+': return '#ef4444'
      case 'A-': return '#991b1b'
      case 'B+': return '#3b82f6'
      case 'B-': return '#1e3a8a'
      case 'AB+': return '#a855f7'
      case 'AB-': return '#581c87'
      default: return '#6b7280'
    }
  }

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>📦 Blood Inventory</h1>
        <button 
          style={styles.addButton} 
          onClick={() => setShowForm((prev) => !prev)}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {showForm ? 'Cancel' : 'Add Stock'}
        </button>
      </div>

      <div style={styles.statsContainer}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #22c55e, #16a34a)'}}>
          <h3 style={styles.statTitle}>Total Units</h3>
          <div style={styles.statValue}>
            <span>{totalUnits}</span>
            <span style={styles.statIcon}>🩸</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
          <h3 style={styles.statTitle}>Low Stock</h3>
          <div style={styles.statValue}>
            <span>{lowStockCount}</span>
            <span style={styles.statIcon}>⚠️</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <h3 style={styles.statTitle}>Expiring Soon</h3>
          <div style={styles.statValue}>
            <span>{expiringSoonCount}</span>
            <span style={styles.statIcon}>⏳</span>
          </div>
        </div>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
          <h3 style={styles.statTitle}>Expired</h3>
          <div style={styles.statValue}>
            <span>{expiredCount}</span>
            <span style={styles.statIcon}>🚫</span>
          </div>
        </div>
      </div>

      {showForm && (
        <div style={styles.formPanel}>
          <h2 style={styles.formTitle}>{editingItem ? 'Edit Inventory' : 'Add New Stock'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {isHospital ? (
              <div style={styles.formGroup}>
                <label style={styles.label}>Hospital</label>
                <input
                  style={{...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed'}}
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
              <label style={styles.label}>Quantity</label>
              <input style={styles.input} type="number" name="quantity" value={form.quantity} onChange={handleChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Expiry Date</label>
              <input style={styles.input} type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
            </div>
            
            <div style={styles.formActions}>
              <button 
                style={{...styles.btnPrimary, opacity: saving ? 0.7 : 1}} 
                type="submit" 
                disabled={saving}
              >
                {saving ? 'Saving...' : editingItem ? 'Update Stock' : 'Save Stock'}
              </button>
              <button style={styles.btnSecondary} type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.filterCard}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍 Search by blood type (e.g. O+)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {!isHospital && (
          <select style={styles.filterSelect} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="">🏥 All hospitals</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
            ))}
          </select>
        )}
      </div>

      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>No inventory found matching your criteria.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Blood Type</th>
                  <th style={styles.th}>Units</th>
                  <th style={styles.th}>Hospital</th>
                  <th style={styles.th}>Expiry</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const expiry = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'
                  const daysToExpiry = item.expiryDate ? (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) : null

                  const isExpired = daysToExpiry !== null && daysToExpiry <= 0
                  const isExpiringSoon = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30
                  const isLow = Number(item.quantity || 0) <= 50

                  let statusBadge = { label: 'Good', bg: '#dcfce7', color: '#15803d' }
                  if (isExpired) {
                    statusBadge = { label: 'Expired', bg: '#fee2e2', color: '#dc2626' }
                  } else if (isExpiringSoon) {
                    statusBadge = { label: 'Expiring Soon', bg: '#fef08a', color: '#a16207' }
                  } else if (isLow) {
                    statusBadge = { label: 'Low', bg: '#fef3c7', color: '#d97706' }
                  }

                  const hospitalName = (() => {
                    if (item.hospital && typeof item.hospital === 'object') {
                      const name = item.hospital.name || item.hospital.username || item.hospital.email
                      if (name) return name
                    }
                    const hId = typeof item.hospital === 'object' ? item.hospital?._id : item.hospital
                    if (hId) {
                      const found = hospitals.find((h) => String(h._id) === String(hId))
                      if (found) return found.name || found.username || found.email
                      if (user && (String(hId) === String(user.id) || String(hId) === String(user._id))) {
                        return user.username || user.name || user.email || 'Your Hospital'
                      }
                    }
                    return '—'
                  })()

                  return (
                    <tr key={item._id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.bloodBadge,
                          backgroundColor: getBloodTypeColor(item.bloodType)
                        }}>
                          {item.bloodType}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.quantityText}>{item.quantity} units</span>
                      </td>
                      <td style={styles.td}>{hospitalName}</td>
                      <td style={styles.td}>{expiry}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button style={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(item._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  pageContainer: {
    padding: '2rem',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    color: '#1f2937'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.025em'
  },
  addButton: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem'
  },
  statCard: {
    padding: '1.5rem',
    borderRadius: '1rem',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  statTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    fontWeight: '500',
    opacity: 0.9
  },
  statValue: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '2.5rem',
    fontWeight: '700'
  },
  statIcon: {
    fontSize: '2.5rem',
    opacity: 0.8
  },
  formPanel: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    marginBottom: '2rem',
    animation: 'slideDown 0.3s ease-out'
  },
  formTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.25rem',
    color: '#374151'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    alignItems: 'end'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4b5563'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    gridColumn: '1 / -1',
    marginTop: '1rem'
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  errorAlert: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    border: '1px solid #f87171'
  },
  filterCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1',
    minWidth: '250px',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    fontSize: '1rem'
  },
  filterSelect: {
    minWidth: '200px',
    padding: '0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
    backgroundColor: '#f9fafb'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    padding: '1rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    color: '#6b7280',
    fontWeight: '600',
    borderBottom: '2px solid #f3f4f6'
  },
  tr: {
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '1rem',
    verticalAlign: 'middle'
  },
  bloodBadge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.875rem',
    display: 'inline-block',
    minWidth: '45px',
    textAlign: 'center'
  },
  quantityText: {
    fontWeight: '700',
    fontSize: '1.125rem'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    padding: '0.375rem 0.75rem',
    border: '1px solid #d1d5db',
    backgroundColor: 'transparent',
    color: '#4b5563',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  deleteBtn: {
    padding: '0.375rem 0.75rem',
    border: '1px solid #fca5a5',
    backgroundColor: 'transparent',
    color: '#dc2626',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTopColor: '#dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#6b7280',
    fontWeight: '500'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyText: {
    fontSize: '1.125rem'
  }
}
