export default function Home() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Predika</h1>
        <p className="text-xl text-gray-600">
          Islamic & Conventional Crowdfunding Platform for UEMOA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="font-bold mb-2">Investors</h3>
          <p className="text-gray-600">
            Invest in promising projects with Islamic or conventional options
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="font-bold mb-2">Projects</h3>
          <p className="text-gray-600">
            Get funded for your business dreams through our platform
          </p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="font-bold mb-2">Secure</h3>
          <p className="text-gray-600">
            BCEAO compliant with industry-leading security standards
          </p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Get Started Today</h2>
        <div className="flex gap-4 justify-center">
          <a href="/register" className="btn btn-primary">
            Register as Investor
          </a>
          <a href="/register" className="btn btn-secondary">
            Submit a Project
          </a>
        </div>
      </div>

      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold mb-2">MVP Status</h3>
        <p className="text-gray-700">
          Predika is currently in Week 0 development. Features are being added weekly.
          Check back soon for authentication, projects, and investment features.
        </p>
      </div>
    </div>
  )
}
