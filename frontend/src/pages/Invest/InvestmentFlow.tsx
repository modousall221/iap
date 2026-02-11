import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface Project {
  id: string
  title: string
  targetAmount: number
  raisedAmount: number
}

interface Investment {
  id: string
  projectId: string
  amount: number
  status: string
  paymentReference?: string
}

type Step = 'amount' | 'review' | 'payment' | 'confirmation'

export default function InvestmentFlow() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('amount')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [project, setProject] = useState<Project | null>(null)
  const [investment, setInvestment] = useState<Investment | null>(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${projectId}`)
      if (response.data.success) {
        setProject(response.data.project)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
      setError('Could not load project details')
    }
  }

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid investment amount')
      return
    }

    const investmentAmount = parseFloat(amount)
    const maxAllowed = project ? project.targetAmount - project.raisedAmount : 0

    if (investmentAmount > maxAllowed) {
      setError(`Maximum allowed investment: ${maxAllowed.toLocaleString()} FCFA`)
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/investments', {
        projectId,
        amount: investmentAmount,
        paymentMethod: 'mobile_money',
      })

      if (response.data.success) {
        setInvestment(response.data.investment)
        setStep('review')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create investment')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!investment) return

    setLoading(true)
    setError('')

    try {
      const response = await api.post(`/investments/${investment.id}/pay`)

      if (response.data.success) {
        setInvestment(response.data.investment)
        setStep('payment')

        // Simulate payment confirmation after 2 seconds
        setTimeout(() => {
          confirmPayment()
        }, 2000)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Payment initiation failed')
      setLoading(false)
    }
  }

  const confirmPayment = async () => {
    if (!investment) return

    try {
      const response = await api.post(`/investments/${investment.id}/confirm`, {
        paymentReference: investment.paymentReference,
      })

      if (response.data.success) {
        setInvestment(response.data.investment)
        setStep('confirmation')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  if (!project) {
    return (
      <div className="container py-12 text-center">
        <p>Loading project details...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div
              className={`flex-1 text-center pb-2 border-b-2 ${
                step === 'amount' || step === 'review' || step === 'payment' || step === 'confirmation'
                  ? 'border-primary'
                  : 'border-gray-200'
              }`}
            >
              <p className="font-medium text-sm">Investment Amount</p>
            </div>
            <div
              className={`flex-1 text-center pb-2 border-b-2 ml-4 ${
                step === 'review' || step === 'payment' || step === 'confirmation'
                  ? 'border-primary'
                  : 'border-gray-200'
              }`}
            >
              <p className="font-medium text-sm">Review</p>
            </div>
            <div
              className={`flex-1 text-center pb-2 border-b-2 ml-4 ${
                step === 'payment' || step === 'confirmation' ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <p className="font-medium text-sm">Payment</p>
            </div>
            <div
              className={`flex-1 text-center pb-2 border-b-2 ml-4 ${
                step === 'confirmation' ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <p className="font-medium text-sm">Confirmation</p>
            </div>
          </div>
        </div>

        {/* Step 1: Amount */}
        {step === 'amount' && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Investment Amount</h2>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold mb-2">{project.title}</h3>
              <p className="text-sm text-gray-600">
                Target: {project.targetAmount.toLocaleString()} FCFA | Raised:{' '}
                {project.raisedAmount.toLocaleString()} FCFA | Remaining:{' '}
                {(project.targetAmount - project.raisedAmount).toLocaleString()} FCFA
              </p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleAmountSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 500000"
                  min="1"
                  max={project.targetAmount - project.raisedAmount}
                  className="input w-full text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Maximum: {(project.targetAmount - project.raisedAmount).toLocaleString()} FCFA
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg"
              >
                {loading ? 'Creating Investment...' : 'Continue to Review'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 'review' && investment && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Review Investment</h2>

            <div className="space-y-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Project</label>
                <p className="text-lg font-bold">{project.title}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Investment Amount</label>
                <p className="text-2xl font-bold text-primary">
                  {investment.amount.toLocaleString()} FCFA
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ By proceeding, you agree to the investment terms and conditions.
                </p>
              </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</div>}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('amount')
                  setInvestment(null)
                  setAmount('')
                }}
                className="flex-1 btn btn-outline"
              >
                Edit Amount
              </button>
              <button onClick={handlePayment} disabled={loading} className="flex-1 btn btn-primary">
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment (Processing) */}
        {step === 'payment' && investment && (
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-6">Processing Payment</h2>

            <div className="mb-8 py-8">
              <div className="inline-block">
                <div className="animate-spin inline-block w-16 h-16 border-4 border-gray-300 border-t-primary rounded-full"></div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Processing mock payment for {investment.amount.toLocaleString()} FCFA...
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {investment.paymentReference && `Payment Ref: ${investment.paymentReference}`}
            </p>
            <p className="text-sm text-gray-600">
              (In production, you would be redirected to Orange Money / MTN / Wave)
            </p>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && investment && (
          <div className="card text-center">
            <div className="mb-6">
              <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Investment Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Your investment of {investment.amount.toLocaleString()} FCFA has been successfully processed.
            </p>

            <div className="bg-green-50 p-6 rounded-lg mb-8">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment ID</span>
                  <span className="font-mono text-sm">{investment.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold">{investment.amount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Ref</span>
                  <span className="font-mono text-sm">{investment.paymentReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="flex-1 btn btn-outline"
              >
                Back to Project
              </button>
              <button onClick={() => navigate('/dashboard')} className="flex-1 btn btn-primary">
                View My Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
