import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

export default function Header() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <nav className="container flex justify-between items-center h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-xl font-bold text-blue-600">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white hidden sm:block">{t('common.appName')}</h1>
        </Link>

        {/* Desktop Menu */}
        {!loading && (
          <div className="hidden md:flex gap-4 items-center">
            <Link to="/projects" className="text-white/90 hover:text-white font-medium transition-colors">
              {t('header.projects')}
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-white/90 hover:text-white font-medium transition-colors">
                  {t('header.login')}
                </Link>
                <Link to="/register" className="btn btn-primary bg-white text-blue-600 hover:bg-blue-50">
                  {t('header.register')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-white/90 hover:text-white font-medium transition-colors">
                  {t('header.dashboard')}
                </Link>
                <Link to="/projects/create" className="text-white/90 hover:text-white font-medium transition-colors">
                  {t('header.createProject')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline border-white text-white hover:bg-white/10"
                >
                  {t('common.logout')}
                </button>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className="text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              title={t('header.language')}
            >
              {i18n.language.toUpperCase()}
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="text-white text-sm font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            {i18n.language.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700 border-t border-blue-500">
          <div className="container py-4 space-y-3">
            <Link to="/projects" className="block text-white/90 hover:text-white font-medium py-2">
              {t('header.projects')}
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block text-white/90 hover:text-white font-medium py-2">
                  {t('header.login')}
                </Link>
                <Link to="/register" className="btn btn-primary w-full text-center bg-white text-blue-600">
                  {t('header.register')}
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block text-white/90 hover:text-white font-medium py-2">
                  {t('header.dashboard')}
                </Link>
                <Link to="/projects/create" className="block text-white/90 hover:text-white font-medium py-2">
                  {t('header.createProject')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full border-white text-white"
                >
                  {t('common.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}


