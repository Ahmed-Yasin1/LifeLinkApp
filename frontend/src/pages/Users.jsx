import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/ApiClient'

const emptyForm = {
  username: '',
  email: '',
  role: 'donor',
  password: '',
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return users

    return users.filter((user) => String(user.username || user.fullName || '').toLowerCase().includes(query))
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/auth/users')
      setUsers(Array.isArray(response?.data?.users) ? response.data.users : [])
      setError('')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in with an admin account to manage users.')
      } else {
        setError(err.message || 'Unable to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const openAddUser = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setFormOpen(true)
    setError('')
  }

  const openEditUser = (user) => {
    setEditingUser(user)
    setForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'donor',
      password: '',
    })
    setFormOpen(true)
    setError('')
  }

  const closeForm = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setFormOpen(false)
    setError('')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitUser = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const payload = {
        username: form.username,
        email: form.email,
        role: form.role,
      }

      if (form.password) {
        payload.password = form.password
      }

      if (editingUser) {
        await apiClient.put(`/auth/users/${editingUser._id}`, payload)
      } else {
        await apiClient.post('/auth/register', payload)
      }

      await loadUsers()
      closeForm()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      setSaving(true)
      await apiClient.put(`/auth/users/${userId}/role`, { role })
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to update role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return

    try {
      setSaving(true)
      await apiClient.delete(`/auth/users/${userId}`)
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Unable to delete user')
    } finally {
      setSaving(false)
    }
  }

  const adminCount = users.filter((user) => user.role === 'admin').length

  const styles = {
    page: {
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '30px',
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
      color: '#333'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    title: {
      fontWeight: 'bold',
      fontSize: '26px',
      margin: 0,
      color: '#111827'
    },
    addButton: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 20px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      padding: '24px',
      borderRadius: '16px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
    },
    statPurple: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    },
    statRed: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    },
    statBlue: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    },
    statInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9,
      marginBottom: '4px'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: 0
    },
    statIcon: {
      fontSize: '40px',
      opacity: 0.8
    },
    filterCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      marginBottom: '30px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    formPanel: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
      marginBottom: '30px',
      border: '1px solid #f3f4f6'
    },
    formTitle: {
      color: '#dc2626',
      marginTop: 0,
      marginBottom: '20px',
      fontSize: '20px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#4b5563'
    },
    input: {
      padding: '10px 14px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none'
    },
    formActions: {
      display: 'flex',
      gap: '12px'
    },
    submitBtn: {
      backgroundColor: '#dc2626',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '10px 20px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px'
    },
    userCard: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '20px',
      fontWeight: 'bold',
      flexShrink: 0
    },
    adminAvatar: { backgroundColor: '#dc2626' },
    hospitalAvatar: { backgroundColor: '#2563eb' },
    donorAvatar: { backgroundColor: '#16a34a' },
    userInfo: {
      flex: 1,
      overflow: 'hidden'
    },
    userName: {
      margin: 0,
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#111827',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    userEmail: {
      margin: '4px 0 0 0',
      fontSize: '13px',
      color: '#6b7280',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    badgesRow: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    badge: {
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
      textTransform: 'capitalize'
    },
    adminBadge: { backgroundColor: '#ef4444' },
    hospitalBadge: { backgroundColor: '#3b82f6' },
    donorBadge: { backgroundColor: '#22c55e' },
    statusBadge: { backgroundColor: '#10b981' },
    cardActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: '16px',
      borderTop: '1px solid #f3f4f6'
    },
    roleSelect: {
      padding: '6px 10px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontSize: '13px',
      outline: 'none',
      backgroundColor: '#f9fafb'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px'
    },
    editBtn: {
      padding: '6px 12px',
      border: '1px solid #3b82f6',
      color: '#3b82f6',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    deleteBtn: {
      padding: '6px 12px',
      border: '1px solid #ef4444',
      color: '#ef4444',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    spinnerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 0'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #dc2626',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: '#9ca3af'
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    errorAlert: {
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid #dc2626',
      color: '#991b1b',
      padding: '16px',
      borderRadius: '6px',
      marginBottom: '20px'
    }
  }

  const getAvatarStyle = (role) => {
    if (role === 'admin') return { ...styles.avatar, ...styles.adminAvatar }
    if (role === 'hospital') return { ...styles.avatar, ...styles.hospitalAvatar }
    return { ...styles.avatar, ...styles.donorAvatar }
  }

  const getBadgeStyle = (role) => {
    if (role === 'admin') return { ...styles.badge, ...styles.adminBadge }
    if (role === 'hospital') return { ...styles.badge, ...styles.hospitalBadge }
    return { ...styles.badge, ...styles.donorBadge }
  }

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .user-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.15) !important; }
          .add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(220, 38, 38, 0.5) !important; }
          .edit-btn:hover { background-color: #eff6ff !important; }
          .del-btn:hover { background-color: #fef2f2 !important; }
        `}
      </style>

      <div style={styles.headerRow}>
        <h1 style={styles.title}>👥 User Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {saving && <span style={{ color: '#6b7280', fontSize: '14px' }}>Saving...</span>}
          <button style={styles.addButton} className="add-btn" onClick={openAddUser}>
            + Add User
          </button>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.statsContainer}>
        <div style={{ ...styles.statCard, ...styles.statPurple }}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Users</span>
            <h3 style={styles.statNumber}>{users.length}</h3>
          </div>
          <div style={styles.statIcon}>👥</div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statRed }}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Admins</span>
            <h3 style={styles.statNumber}>{adminCount}</h3>
          </div>
          <div style={styles.statIcon}>🛡️</div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statBlue }}>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Hospitals</span>
            <h3 style={styles.statNumber}>{users.filter((user) => user.role === 'hospital').length}</h3>
          </div>
          <div style={styles.statIcon}>🏥</div>
        </div>
      </div>

      <div style={styles.filterCard}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {formOpen && (
        <div style={styles.formPanel}>
          <h5 style={styles.formTitle}>{editingUser ? 'Edit User' : 'Add User'}</h5>
          <form onSubmit={handleSubmitUser}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Name</label>
                <input
                  style={styles.input}
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter name"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.input}
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                >
                  <option value="admin">Admin</option>
                  <option value="hospital">Hospital</option>
                  <option value="donor">Donor</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Password {editingUser ? '(leave blank to keep current)' : ''}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder={editingUser ? 'Optional' : 'Enter password'}
                  required={!editingUser}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button style={styles.submitBtn} type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
              <button style={styles.cancelBtn} type="button" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👤</div>
          <h3>No users found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredUsers.map((user) => {
            const displayName = user.username || user.fullName || 'User';
            const initial = displayName.charAt(0).toUpperCase();

            return (
              <div key={user._id} style={styles.userCard} className="user-card">
                <div style={styles.cardHeader}>
                  <div style={getAvatarStyle(user.role)}>
                    {initial}
                  </div>
                  <div style={styles.userInfo}>
                    <h4 style={styles.userName}>{displayName}</h4>
                    <p style={styles.userEmail}>{user.email}</p>
                  </div>
                </div>

                <div style={styles.badgesRow}>
                  <span style={getBadgeStyle(user.role)}>{user.role || 'donor'}</span>
                  <span style={{ ...styles.badge, ...styles.statusBadge }}>Active</span>
                </div>

                <div style={styles.cardActions}>
                  <select
                    style={styles.roleSelect}
                    value={user.role || 'donor'}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={saving}
                  >
                    <option value="admin">Admin</option>
                    <option value="hospital">Hospital</option>
                    <option value="donor">Donor</option>
                  </select>

                  <div style={styles.actionButtons}>
                    <button
                      style={styles.editBtn}
                      className="edit-btn"
                      onClick={() => openEditUser(user)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      className="del-btn"
                      onClick={() => handleDelete(user._id)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
