import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Header() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container flex justify-between items-center h-16">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Predika</h1>
        </Link>

        {!loading && (
          <div className="flex gap-4 items-center">
            <Link to="/projects" className="text-gray-700 hover:text-primary font-medium">
              Projects
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary font-medium">
                  Dashboard
                </Link>
                <Link to="/projects/create" className="text-gray-700 hover:text-primary font-medium">
                  Create Project
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

