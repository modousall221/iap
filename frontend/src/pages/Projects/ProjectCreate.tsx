import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    targetAmount: '',
    category: '',
    country: '',
    contractType: 'conventional_loan',
    shariaCompliant: false,
    deadline: '',
    expectedReturn: '',
    riskLevel: 'medium',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await api.post('/projects', formData)
      if (response.data.success) {
        navigate(`/projects/${response.data.project.id}`)
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({
          form: error.response?.data?.error || 'Failed to create project',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600 mb-8">
          Fill in the details below to create your fundraising project. Your project will be
          reviewed by our team before being published.
        </p>

        <form onSubmit={handleSubmit} className="card">
          {/* Form Error */}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errors.form}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold mb-6">Basic Information</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Project title (min 5 characters)"
                className="input"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief project description (min 10 characters)"
                rows={3}
                className="input"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                placeholder="Full project description and business plan"
                rows={5}
                className="input"
              />
              {errors.longDescription && (
                <p className="text-red-600 text-sm mt-1">{errors.longDescription}</p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold mb-6">Financial Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (FCFA)
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  placeholder="1000000"
                  min="0"
                  className="input"
                />
                {errors.targetAmount && (
                  <p className="text-red-600 text-sm mt-1">{errors.targetAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Return (%)
                </label>
                <input
                  type="number"
                  name="expectedReturn"
                  value={formData.expectedReturn}
                  onChange={handleChange}
                  placeholder="15"
                  min="0"
                  max="100"
                  className="input"
                />
                {errors.expectedReturn && (
                  <p className="text-red-600 text-sm mt-1">{errors.expectedReturn}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input"
              />
              {errors.deadline && <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Project Details */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold mb-6">Project Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input">
                  <option value="">Select a category</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="energy">Energy</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select name="country" value={formData.country} onChange={handleChange} className="input">
                  <option value="">Select a country</option>
                  <option value="SN">Senegal</option>
                  <option value="ML">Mali</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="CI">Ivory Coast</option>
                  <option value="TG">Togo</option>
                </select>
                {errors.country && (
                  <p className="text-red-600 text-sm mt-1">{errors.country}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Type
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="conventional_loan">Conventional Loan</option>
                  <option value="mudarabah">Mudarabah (Profit Sharing)</option>
                  <option value="musharaka">Musharaka (Partnership)</option>
                </select>
                {errors.contractType && (
                  <p className="text-red-600 text-sm mt-1">{errors.contractType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} className="input">
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                {errors.riskLevel && (
                  <p className="text-red-600 text-sm mt-1">{errors.riskLevel}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="shariaCompliant"
                  checked={formData.shariaCompliant}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  This project complies with Islamic Finance principles (Sharia-compliant)
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn btn-primary">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
