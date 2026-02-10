export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container flex justify-between items-center h-16">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Predika</h1>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="text-gray-700 hover:text-primary">
            Login
          </a>
          <a href="/register" className="btn btn-primary">
            Register
          </a>
        </div>
      </nav>
    </header>
  )
}
