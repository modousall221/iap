import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  targetAmount: number
  raisedAmount: number
  category: string
  country: string
  contractType: string
  shariaCompliant: boolean
  status: string
  deadline: string
  expectedReturn: number
  riskLevel: string
  owner: {
    id: string
    email: string
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`)
        if (response.data.success) {
          setProject(response.data.project)
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    fetchProject()
    fetchUser()
  }, [id])

  if (loading) {
    return <div className="container py-12 text-center">Loading project...</div>
  }

  if (!project) {
    return <div className="container py-12 text-center">Project not found</div>
  }

  const fundingPercentage = Math.round((project.raisedAmount / project.targetAmount) * 100)

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
      month: 'long',
      day: 'numeric',
    })
  }

  const isProjectActive = project.status === 'funding'

  return (
    <div className="container py-12">
      <Link to="/projects" className="text-primary hover:underline mb-8">
        ← Back to Projects
      </Link>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-bold">{project.title}</h1>
            <div className="flex gap-2">
              {project.shariaCompliant && (
                <span className="px-3 py-1 bg-green-100 text-green-800 font-medium rounded">
                  Islamic Finance
                </span>
              )}
              <span
                className={`px-3 py-1 font-medium rounded ${getRiskColor(project.riskLevel)}`}
              >
                {project.riskLevel.charAt(0).toUpperCase() + project.riskLevel.slice(1)} Risk
              </span>
            </div>
          </div>

          <div className="flex gap-6 text-gray-600">
            <span className="font-medium">Category: {project.category}</span>
            <span className="font-medium">Country: {project.country}</span>
            <span className="font-medium">Type: {project.contractType}</span>
          </div>
        </div>

        {/* Funding Card */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Funding Goal</h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>{fundingPercentage}% Funded</span>
              <span className="text-primary">
                {project.raisedAmount.toLocaleString()} / {project.targetAmount.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
            <div>
              <p className="text-gray-600 text-sm">Deadline</p>
              <p className="text-lg font-bold">{formatDate(project.deadline)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Expected Return</p>
              <p className="text-lg font-bold text-green-600">{project.expectedReturn}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Contract Type</p>
              <p className="text-lg font-bold capitalize">{project.contractType}</p>
            </div>
          </div>

          {/* Action Button */}
          {isProjectActive ? (
            !user ? (
              <button
                onClick={() => navigate('/login')}
                className="w-full btn btn-primary btn-lg"
              >
                Sign In to Invest
              </button>
            ) : user.role === 'investor' || user.role === 'entrepreneur' ? (
              <button
                onClick={() => navigate(`/invest/${project.id}`)}
                className="w-full btn btn-primary btn-lg"
              >
                Invest Now
              </button>
            ) : (
              <div className="w-full p-4 bg-gray-100 text-center rounded-lg text-gray-600">
                Admin users cannot invest in projects
              </div>
            )
          ) : (
            <div className="w-full p-4 bg-yellow-100 text-yellow-800 text-center rounded-lg font-medium">
              Project is not accepting investments
            </div>
          )}
        </div>

        {/* Description */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">About This Project</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {project.longDescription || project.description}
          </p>
        </div>

        {/* Project Owner */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Project Owner</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {project.owner.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-lg">{project.owner.email}</p>
              <p className="text-gray-600">Entrepreneur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
