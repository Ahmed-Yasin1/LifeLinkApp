import { useEffect, useState } from 'react'
import { getDonationHistory, searchDonors, updateDonor } from '../api/DonorApi'
import { DISTRICTS } from '../constants/districts'
import useAuth from '../hooks/useAuth'

export default function Donations() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [district, setDistrict] = useState('')

  const loadData = async () => {
    if (user?.role !== 'donor') {
      setError('This page is only available for donor accounts.')
      setLoading(false)
      return
    }

    if (!user?.donorId) {
      setError('No donor profile linked to this account.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const donorResponse = await getDonorById(user.donorId)
      const donor = donorResponse?.data?.donor || null

      if (!donor) {
        setProfile(null)
        setHistory([])
        setDistrict('')
        return
      }

      setProfile(donor)
      setDistrict(donor.district || '')

      const historyResponse = await getDonationHistory(donor._id)
      setHistory(historyResponse?.data?.donationHistory || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load donation data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleDistrictSave = async (e) => {
    e.preventDefault()
    if (!profile?._id) return

    try {
      setSaving(true)
      setError('')
      await updateDonor(profile._id, { district })
      await loadData()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString()
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h1 className="h3 text-danger mb-2">Donation History</h1>
              <p className="text-muted mb-0">View your personal donation records and update your district.</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Loading your donation history...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="text-danger">My Profile</h5>
                <p className="mb-1"><strong>Name:</strong> {profile?.fullName || '—'}</p>
                <p className="mb-1"><strong>Phone:</strong> {profile?.phone || '—'}</p>
                <p className="mb-1"><strong>Blood Group:</strong> {profile?.bloodGroup || '—'}</p>
                <form onSubmit={handleDistrictSave} className="mt-3">
                  <label className="form-label">District</label>
                  <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)} required>
                    <option value="">Select district</option>
                    {DISTRICTS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <button className="btn btn-danger mt-2" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update District'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="text-danger">Donation History</h5>
                {history.length === 0 ? (
                  <p className="text-muted mb-0">No donation records found yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record) => (
                          <tr key={record._id || record.date}>
                            <td>{formatDate(record.date)}</td>
                            <td>{record.location || '—'}</td>
                            <td>{record.status || 'Completed'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
