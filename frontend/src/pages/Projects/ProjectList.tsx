import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

interface Project {
  id: string
  title: string
  description: string
  targetAmount: number
  raisedAmount: number
  category: string
  country: string
  contractType: string
  shariaCompliant: boolean
  status: string
  deadline: string
  riskLevel: string
  owner: {
    email: string
  }
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [country, setCountry] = useState('')
  const [search, setSearch] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    fetchProjects()
  }, [category, country, limit, offset])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (category) params.append('category', category)
      if (country) params.append('country', country)
      if (search) params.append('search', search)

      const response = await api.get(`/projects?${params.toString()}`)
      if (response.data.success) {
        setProjects(response.data.data || [])
        setTotal(response.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    fetchProjects()
  }

  const getFundingPercentage = (project: Project) => {
    if (project.targetAmount === 0) return 0
    return Math.round((project.raisedAmount / project.targetAmount) * 100)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading && projects.length === 0) {
    return <div className="container py-12 text-center">Loading projects...</div>
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Invest in Projects</h1>
        <p className="text-gray-600">Browse and support ongoing fundraising initiatives</p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="agriculture">Agriculture</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="energy">Energy</option>
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
            >
              <option value="">All Countries</option>
              <option value="SN">Senegal</option>
              <option value="ML">Mali</option>
              <option value="BF">Burkina Faso</option>
              <option value="CI">Ivory Coast</option>
              <option value="TG">Togo</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <div className="card hover:shadow-lg transition-shadow h-full cursor-pointer">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold line-clamp-2">{project.title}</h3>
                    {project.shariaCompliant && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Halal
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{project.owner.email}</p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {project.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    {project.contractType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(project.riskLevel)}`}>
                    {project.riskLevel} risk
                  </span>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {getFundingPercentage(project)}% funded
                    </span>
                    <span className="text-gray-500">
                      {project.raisedAmount.toLocaleString()} / {project.targetAmount.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getFundingPercentage(project), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Deadline: {formatDate(project.deadline)}</span>
                  <span className="text-primary font-medium hover:underline">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="btn btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-2">
            Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="btn btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
