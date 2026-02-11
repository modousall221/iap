import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface User {
  id: string
  email: string
  role: string
  kycStatus: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return <div className="container py-12 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="container py-12 text-center">User not found</div>
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="btn btn-outline"
          >
            Logout
          </button>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="text-gray-900 capitalize">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">KYC Status</label>
              <p className="text-gray-900">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.kycStatus === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : user.kycStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.kycStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          {user.kycStatus === 'pending' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Your KYC verification is pending. Please upload your documents to continue.
              </p>
            </div>
          ) : user.kycStatus === 'approved' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Your KYC verification is complete! You can now invest in projects.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Your KYC verification was rejected. Please contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
