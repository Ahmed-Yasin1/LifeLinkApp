import { Fragment, useEffect, useMemo, useState } from 'react'
import { DISTRICTS } from '../constants/districts'
import useAuth from '../hooks/useAuth'
import {
  createDonor,
  deleteDonor,
  searchDonors,
  updateDonor,
  getDonationHistory,
  addDonationRecord,
  updateDonationRecord,
  deleteDonationRecord,
} from '../api/DonorApi'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  age: '',
  bloodGroup: 'O+',
  address: '',
  city: '',
  district: '',
  lastDonationDate: '',
  medicalNotes: ''
}

const initialDonationForm = {
  date: '',
  location: '',
  status: 'Completed'
}

const donationStatuses = ['Completed', 'Scheduled', 'Cancelled', 'Pending']

export default function Donors() {
  const { user: currentUser } = useAuth()
  const isHospital = currentUser?.role === 'hospital'
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [donationSaving, setDonationSaving] = useState(false)
  const [error, setError] = useState('')
  const [donationError, setDonationError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [editingDonor, setEditingDonor] = useState(null)
  const [editingDonation, setEditingDonation] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [donationForm, setDonationForm] = useState(initialDonationForm)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [donationHistory, setDonationHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('')

  const filteredDonors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return donors.filter((donor) => {
      const matchesQuery = !query || [donor.fullName, donor.phone, donor.city, donor.district]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

      const matchesBloodGroup = !bloodGroupFilter || donor.bloodGroup === bloodGroupFilter

      return matchesQuery && matchesBloodGroup
    })
  }, [donors, searchTerm, bloodGroupFilter])

  const isDonor = currentUser?.role === 'donor'

  const loadDonors = async () => {
    try {
      setLoading(true)
      const response = await searchDonors()
      const donorList = response?.data?.donors || []
      setDonors(donorList)
      setError('')

      if (isDonor && donorList.length > 0) {
        const myDonor = donorList[0]
        setSelectedDonor(myDonor)
        await loadDonationHistory(myDonor._id)
      }

      return donorList
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load donors')
      return []
    } finally {
      setLoading(false)
    }
  }

  const loadDonationHistory = async (donorId) => {
    if (!donorId) return
    try {
      setHistoryLoading(true)
      const response = await getDonationHistory(donorId)
      setDonationHistory(response?.data?.donationHistory || [])
      setDonationError('')
    } catch (err) {
      setDonationError(err.response?.data?.error || err.message || 'Unable to load donation history')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadDonors()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingDonor(null)
    setShowForm(false)
  }

  const resetDonationForm = () => {
    setDonationForm(initialDonationForm)
    setEditingDonation(null)
    setShowDonationForm(false)
    setDonationError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDonationChange = (e) => {
    const { name, value } = e.target
    setDonationForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        lastDonationDate: form.lastDonationDate || undefined
      }

      if (editingDonor) {
        await updateDonor(editingDonor._id, payload)
      } else {
        await createDonor(payload)
      }

      const updatedDonors = await loadDonors()
      if (selectedDonor) {
        const current = updatedDonors.find((item) => item._id === selectedDonor._id)
        if (current) setSelectedDonor(current)
      }

      resetForm()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to save donor')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (donor) => {
    setEditingDonor(donor)
    setForm({
      fullName: donor.fullName || '',
      email: donor.email || '',
      phone: donor.phone || '',
      age: donor.age || '',
      bloodGroup: donor.bloodGroup || 'O+',
      address: donor.address || '',
      city: donor.city || '',
      district: donor.district || '',
      lastDonationDate: donor.lastDonationDate ? new Date(donor.lastDonationDate).toISOString().split('T')[0] : '',
      medicalNotes: donor.medicalNotes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donor?')) return

    try {
      await deleteDonor(id)
      await loadDonors()
      if (selectedDonor?._id === id) {
        setSelectedDonor(null)
        setDonationHistory([])
        setShowDonationForm(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to delete donor')
    }
  }

  const handleSelectDonor = async (donor) => {
    if (selectedDonor?._id === donor._id) {
      setSelectedDonor(null)
      setDonationHistory([])
      setShowDonationForm(false)
      setEditingDonation(null)
      setDonationError('')
      return
    }
    setSelectedDonor(donor)
    setShowDonationForm(false)
    setEditingDonation(null)
    setDonationForm(initialDonationForm)
    await loadDonationHistory(donor._id)
  }

  const handleDonationSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDonor) return

    setDonationSaving(true)
    setDonationError('')

    try {
      const payload = {
        ...donationForm,
        date: donationForm.date || new Date().toISOString().split('T')[0]
      }

      if (editingDonation) {
        await updateDonationRecord(selectedDonor._id, editingDonation._id, payload)
      } else {
        await addDonationRecord(selectedDonor._id, payload)
      }

      const updatedDonors = await loadDonors()
      const current = updatedDonors.find((item) => item._id === selectedDonor._id)
      if (current) setSelectedDonor(current)
      await loadDonationHistory(selectedDonor._id)
      resetDonationForm()
    } catch (err) {
      setDonationError(err.response?.data?.error || err.message || 'Unable to save donation record')
    } finally {
      setDonationSaving(false)
    }
  }

  const handleDonationEdit = (record) => {
    setEditingDonation(record)
    setDonationForm({
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      location: record.location || '',
      status: record.status || 'Completed'
    })
    setShowDonationForm(true)
  }

  const handleDonationDelete = async (record) => {
    if (!selectedDonor || !window.confirm('Delete this donation record?')) return

    try {
      await deleteDonationRecord(selectedDonor._id, record._id)
      const updatedDonors = await loadDonors()
      const current = updatedDonors.find((item) => item._id === selectedDonor._id)
      if (current) setSelectedDonor(current)
      await loadDonationHistory(selectedDonor._id)
    } catch (err) {
      setDonationError(err.response?.data?.error || err.message || 'Unable to delete donation record')
    }
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString()
  }

  const eligibleCount = donors.filter((donor) => donor.eligibilityStatus !== false).length
  const pendingCount = donors.filter((donor) => donor.eligibilityStatus === false).length

  // Styles Object
  const styles = {
    pageBg: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '2rem', fontFamily: '"Inter", sans-serif' },
    headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    btnAdd: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { padding: '1.5rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    statRed: { background: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    statGreen: { background: 'linear-gradient(135deg, #10b981, #047857)' },
    statOrange: { background: 'linear-gradient(135deg, #f59e0b, #b45309)' },
    statIconWrapper: { fontSize: '2.5rem', background: 'rgba(255,255,255,0.2)', width: '72px', height: '72px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statContent: { display: 'flex', flexDirection: 'column' },
    statValue: { fontSize: '2.25rem', fontWeight: 'bold', margin: 0, lineHeight: 1 },
    statLabel: { fontSize: '1rem', opacity: 0.9, marginTop: '0.25rem' },
    filterRow: { display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    input: { padding: '0.875rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', flex: 1, outline: 'none', fontSize: '1rem' },
    select: { padding: '0.875rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', fontSize: '1rem', minWidth: '180px', backgroundColor: 'white' },
    donorsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
    donorCard: { background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    donorCardHeader: { display: 'flex', gap: '1rem', alignItems: 'center' },
    avatar: { width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 },
    donorInfo: { display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' },
    donorName: { fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    donorContact: { fontSize: '0.875rem', color: '#6b7280', margin: 0 },
    badgesRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' },
    badge: { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    bgO: { backgroundColor: '#dcfce7', color: '#166534' },
    bgA: { backgroundColor: '#fee2e2', color: '#991b1b' },
    bgB: { backgroundColor: '#dbeafe', color: '#1e40af' },
    bgAB: { backgroundColor: '#f3e8ff', color: '#6b21a8' },
    statusEligible: { backgroundColor: '#dcfce7', color: '#166534' },
    statusPending: { backgroundColor: '#fef3c7', color: '#92400e' },
    locationRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.875rem' },
    actionButtons: { display: 'flex', gap: '0.5rem', marginTop: 'auto' },
    btnManage: { flex: 1, padding: '0.625rem', border: '1px solid #3b82f6', color: '#3b82f6', background: 'transparent', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    btnEdit: { padding: '0.625rem 1rem', border: '1px solid #9ca3af', color: '#4b5563', background: 'transparent', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    btnDelete: { padding: '0.625rem 1rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    panel: { background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '2rem' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    panelTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
    formActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem', gridColumn: '1 / -1' },
    btnCancel: { padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', color: '#374151', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    th: { textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontWeight: '600' },
    td: { padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#111827' },
    statusCompleted: { backgroundColor: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    statusScheduled: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    statusCancelled: { backgroundColor: '#f3f4f6', color: '#374151', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    statusPendingDonation: { backgroundColor: '#fef3c7', color: '#92400e', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
    spinnerContainer: { display: 'flex', justifyContent: 'center', padding: '4rem' },
    spinner: { width: '48px', height: '48px', border: '4px solid #fee2e2', borderTop: '4px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: '#6b7280', background: 'white', borderRadius: '16px' },
    emptyIcon: { fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 },
    alertError: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' },
  }

  const getBloodGroupStyle = (bg) => {
    if (!bg) return styles.bgO
    if (bg.startsWith('O')) return styles.bgO
    if (bg.startsWith('A') && bg.length <= 2) return styles.bgA
    if (bg.startsWith('B') && bg.length <= 2) return styles.bgB
    if (bg.startsWith('AB')) return styles.bgAB
    return styles.bgO
  }

  const getDonationStatusStyle = (status) => {
    if (status === 'Completed') return styles.statusCompleted
    if (status === 'Scheduled') return styles.statusScheduled
    if (status === 'Cancelled') return styles.statusCancelled
    if (status === 'Pending') return styles.statusPendingDonation
    return styles.statusCompleted
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name[0].toUpperCase()
  }

  return (
    <div style={styles.pageBg}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .btn-hover:hover { opacity: 0.9; transform: translateY(-1px); }
          .btn-outline-hover:hover { background-color: #f3f4f6; }
          .donor-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        `}
      </style>

      <div style={styles.headerContainer}>
        <h1 style={styles.headerTitle}>{isDonor ? '🩸 My Donor Profile & History' : '🩸 Donor Management'}</h1>
        {!isDonor && (
          <button style={styles.btnAdd} className="btn-hover" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Cancel' : '+ Add Donor'}
          </button>
        )}
      </div>

      {!isDonor && (
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, ...styles.statRed }}>
            <div style={styles.statIconWrapper}>🩸</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Registered Donors</p>
              <h3 style={styles.statValue}>{donors.length}</h3>
            </div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statGreen }}>
            <div style={styles.statIconWrapper}>✅</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Eligible Today</p>
              <h3 style={styles.statValue}>{eligibleCount}</h3>
            </div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statOrange }}>
            <div style={styles.statIconWrapper}>⏳</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Pending Review</p>
              <h3 style={styles.statValue}>{pendingCount}</h3>
            </div>
          </div>
        </div>
      )}

      {!isDonor && (
        <div style={styles.filterRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select style={styles.select} value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)}>
            <option value="">All blood groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      )}

      {error && <div style={styles.alertError}>{error}</div>}

      {showForm && (
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>{editingDonor ? 'Edit Donor' : 'Add New Donor'}</h2>
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input style={styles.input} name="fullName" value={form.fullName} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password (for donor login)</label>
                <input style={styles.input} type="password" name="password" value={form.password || ''} onChange={handleChange} placeholder={editingDonor ? 'Leave blank to keep current' : 'Enter password'} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Age</label>
                <input style={styles.input} type="number" name="age" value={form.age} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Group</label>
                <select style={styles.select} name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input style={styles.input} name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>District</label>
                <select style={styles.select} name="district" value={form.district} onChange={handleChange} required>
                  <option value="">Select district</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Donation Date</label>
                <input style={styles.input} type="date" name="lastDonationDate" value={form.lastDonationDate} onChange={handleChange} />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Medical Notes</label>
                <textarea style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} name="medicalNotes" value={form.medicalNotes} onChange={handleChange} />
              </div>
            </div>
            <div style={styles.formActions}>
              <button style={styles.btnAdd} className="btn-hover" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingDonor ? 'Update Donor' : 'Save Donor'}
              </button>
              <button style={styles.btnCancel} className="btn-outline-hover" type="button" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👤</div>
          <h2>No donors found</h2>
          <p>Try adjusting your search filters or add a new donor.</p>
        </div>
      ) : (
        <div style={styles.donorsGrid}>
          {filteredDonors.map((donor) => {
            const isSelected = selectedDonor?._id === donor._id
            return (
              <Fragment key={donor._id}>
                <div 
                  className="donor-card" 
                  style={{ 
                    ...styles.donorCard, 
                    transition: 'all 0.3s',
                    border: isSelected ? '2px solid #dc2626' : '1px solid transparent',
                    boxShadow: isSelected ? '0 0 0 4px rgba(220, 38, 38, 0.15)' : '0 10px 15px -3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={styles.donorCardHeader}>
                    <div style={styles.avatar}>{getInitials(donor.fullName)}</div>
                    <div style={styles.donorInfo}>
                      <h3 style={styles.donorName}>{donor.fullName}</h3>
                      <p style={styles.donorContact}>{donor.phone || '—'} • {donor.email}</p>
                    </div>
                  </div>

                  <div style={styles.badgesRow}>
                    <span style={{ ...styles.badge, ...getBloodGroupStyle(donor.bloodGroup) }}>
                      {donor.bloodGroup}
                    </span>
                    <span style={{ ...styles.badge, ...(donor.eligibilityStatus === false ? styles.statusPending : styles.statusEligible) }}>
                      {donor.eligibilityStatus === false ? 'Pending' : 'Eligible'}
                    </span>
                  </div>

                  <div style={styles.locationRow}>
                    📍 {donor.city}{donor.district ? `, ${donor.district}` : ''}
                  </div>

                  <div style={styles.actionButtons}>
                    <button 
                      style={{ 
                        ...styles.btnManage, 
                        backgroundColor: isSelected ? '#dc2626' : 'transparent',
                        color: isSelected ? 'white' : '#3b82f6',
                        borderColor: isSelected ? '#dc2626' : '#3b82f6'
                      }} 
                      className="btn-outline-hover" 
                      onClick={() => handleSelectDonor(donor)}
                    >
                      {isDonor 
                        ? (isSelected ? 'Hide Donation History' : 'View Donation History') 
                        : (isSelected ? 'Close History' : 'Manage Donations')}
                    </button>
                    {!isDonor && (
                      <button style={styles.btnEdit} className="btn-outline-hover" onClick={() => handleEdit(donor)}>
                        Edit
                      </button>
                    )}
                    {!isDonor && (
                      <button style={styles.btnDelete} className="btn-outline-hover" onClick={() => handleDelete(donor._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div style={{ ...styles.panel, gridColumn: '1 / -1', marginTop: '0.5rem', marginBottom: '1.5rem', borderTop: '4px solid #dc2626' }}>
                    <div style={styles.panelHeader}>
                      <div>
                        <h2 style={styles.panelTitle}>Donation History — {donor.fullName}</h2>
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ ...styles.badge, ...(donor.eligibilityStatus === false ? styles.statusPending : styles.statusEligible) }}>
                            {donor.eligibilityStatus === false ? 'Pending' : 'Eligible'}
                          </span>
                          {donor.lastDonationDate && (
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                              Last donation: {formatDate(donor.lastDonationDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isDonor && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button style={styles.btnAdd} className="btn-hover" onClick={() => setShowDonationForm((prev) => !prev)}>
                            {showDonationForm ? 'Cancel' : '+ Add Donation'}
                          </button>
                          <button style={styles.btnCancel} className="btn-outline-hover" onClick={() => {
                            setSelectedDonor(null)
                            setDonationHistory([])
                            setShowDonationForm(false)
                            setEditingDonation(null)
                            setDonationError('')
                          }}>
                            Close
                          </button>
                        </div>
                      )}
                    </div>

                    {donationError && <div style={styles.alertError}>{donationError}</div>}

                    {showDonationForm && (
                      <form onSubmit={handleDonationSubmit} style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: 0, marginBottom: '1rem', color: '#dc2626' }}>
                          {editingDonation ? 'Edit Donation Record' : 'New Donation Record'}
                        </h3>
                        <div style={styles.formGrid}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Donation Date</label>
                            <input style={styles.input} type="date" name="date" value={donationForm.date} onChange={handleDonationChange} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Location</label>
                            <input style={styles.input} name="location" value={donationForm.location} onChange={handleDonationChange} required />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Status</label>
                            <select style={styles.select} name="status" value={donationForm.status} onChange={handleDonationChange}>
                              {donationStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ ...styles.formActions, marginTop: '1rem' }}>
                          <button style={{ ...styles.btnAdd, padding: '0.5rem 1rem' }} className="btn-hover" type="submit" disabled={donationSaving}>
                            {donationSaving ? 'Saving...' : editingDonation ? 'Update Record' : 'Save Record'}
                          </button>
                          <button style={{ ...styles.btnCancel, padding: '0.5rem 1rem' }} className="btn-outline-hover" type="button" onClick={resetDonationForm}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {historyLoading ? (
                      <div style={styles.spinnerContainer}>
                        <div style={styles.spinner}></div>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Date</th>
                              <th style={styles.th}>Location</th>
                              <th style={styles.th}>Status</th>
                              {!isDonor && <th style={styles.th}>Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {donationHistory.length === 0 ? (
                              <tr>
                                <td colSpan={isDonor ? "3" : "4"} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                  No donation records found for your account.
                                </td>
                              </tr>
                            ) : (
                              donationHistory.map((record) => (
                                <tr key={record._id || record.date}>
                                  <td style={styles.td}>{formatDate(record.date)}</td>
                                  <td style={styles.td}>{record.location || '—'}</td>
                                  <td style={styles.td}>
                                    <span style={getDonationStatusStyle(record.status)}>
                                      {record.status}
                                    </span>
                                  </td>
                                  {!isDonor && (
                                    <td style={styles.td}>
                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button style={styles.btnEdit} className="btn-outline-hover" onClick={() => handleDonationEdit(record)}>
                                          Edit
                                        </button>
                                        <button style={styles.btnDelete} className="btn-outline-hover" onClick={() => handleDonationDelete(record)}>
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
