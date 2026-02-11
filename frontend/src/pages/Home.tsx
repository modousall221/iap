import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container py-20 lg:py-28">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {t('home.title')}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/projects" className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              {t('home.browseProjects')}
            </Link>
            <Link to="/register" className="btn bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
              {t('home.registerInvestor')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 lg:py-20 border-y border-gray-200">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16">{t('home.getStarted')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-200 hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('home.investors')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.investorsDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-200 hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('home.projects')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.projectsDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-200 hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">{t('home.secure')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.secureDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Sharia Compliant */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('home.sharia')}</h3>
                <p className="text-gray-600">
                  {t('home.shariaDesc')}
                </p>
              </div>
            </div>

            {/* Regulated */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚖️</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('home.regulated')}</h3>
                <p className="text-gray-600">
                  {t('home.regulatedDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 lg:py-20">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            {t('home.getStarted')}
          </h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/projects" className="btn bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold">
              {t('home.browseProjects')}
            </Link>
            <Link to="/register" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 font-semibold">
              {t('common.appName')} {t('home.registerInvestor')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
