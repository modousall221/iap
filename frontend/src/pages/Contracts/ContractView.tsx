import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface ContractTerms {
  projectTitle: string
  investorEmail: string
  entrepreneurEmail: string
  investmentAmount: number
  contractType: string
  profitShare?: number
  expectedReturn?: number
  startDate: string
  endDate: string
  conditions?: string[]
}

interface Contract {
  id: string
  investmentId: string
  contractType: string
  status: string
  contractPdfUrl: string
  termsJSON: ContractTerms | string
  investorSignedAt?: string
  entrepreneurSignedAt?: string
  adminSignedAt?: string
}

export default function ContractView() {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchContract()
    fetchUser()
  }, [contractId])

  const fetchContract = async () => {
    try {
      const response = await api.get(`/contracts/${contractId}`)
      if (response.data.success) {
        setContract(response.data.contract)
      } else {
        setError('Failed to load contract')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load contract')
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

  const handleSign = async (signer: string) => {
    setSigning(true)
    setError('')

    try {
      const response = await api.post(`/contracts/${contractId}/sign`, {
        signer,
      })

      if (response.data.success) {
        setContract(response.data.contract)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to sign contract')
    } finally {
      setSigning(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/contracts/${contractId}/download`)
      if (response.data.success && response.data.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to download contract:', error)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <p>Loading contract...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto card text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Contract not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const terms = typeof contract.termsJSON === 'string' ? JSON.parse(contract.termsJSON) : contract.termsJSON

  const isInvestor = user?.email === terms.investorEmail
  const isEntrepreneur = user?.email === terms.entrepreneurEmail
  const isAdmin = user?.role === 'admin'

  const investorSigned = !!contract.investorSignedAt
  const entrepreneurSigned = !!contract.entrepreneurSignedAt
  const adminSigned = !!contract.adminSignedAt

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Investment Contract</h1>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 mb-2">Contract ID: {contractId?.slice(0, 8)}...</p>
              <span
                className={`px-3 py-1 rounded-full font-medium text-sm ${
                  contract.status === 'signed'
                    ? 'bg-green-100 text-green-800'
                    : contract.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </span>
            </div>
            <button onClick={handleDownload} className="btn btn-outline">
              Download PDF
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}

        {/* Contract Overview */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Contract Overview</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Project</label>
                <p className="font-bold text-lg">{terms.projectTitle}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Contract Type</label>
                <p className="font-bold text-lg capitalize">
                  {contract.contractType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Investment Amount</label>
                <p className="font-bold text-lg text-primary">
                  {terms.investmentAmount.toLocaleString()} FCFA
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Expected Return</label>
                <p className="font-bold text-lg">{terms.expectedReturn || 'TBD'}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Start Date</label>
                <p className="font-bold">{new Date(terms.startDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">End Date</label>
                <p className="font-bold">{new Date(terms.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Parties</h2>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Investor</p>
                {investorSigned && (
                  <span className="text-green-600 font-medium">
                    ✓ Signed {new Date(contract.investorSignedAt!).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{terms.investorEmail}</p>
              {!investorSigned && isInvestor && (
                <button
                  onClick={() => handleSign('investor')}
                  disabled={signing}
                  className="mt-3 btn btn-sm btn-primary"
                >
                  {signing ? 'Signing...' : 'Sign as Investor'}
                </button>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Entrepreneur</p>
                {entrepreneurSigned && (
                  <span className="text-green-600 font-medium">
                    ✓ Signed {new Date(contract.entrepreneurSignedAt!).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{terms.entrepreneurEmail}</p>
              {!entrepreneurSigned && isEntrepreneur && (
                <button
                  onClick={() => handleSign('entrepreneur')}
                  disabled={signing}
                  className="mt-3 btn btn-sm btn-primary"
                >
                  {signing ? 'Signing...' : 'Sign as Entrepreneur'}
                </button>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Platform Admin</p>
                {adminSigned && (
                  <span className="text-green-600 font-medium">
                    ✓ Signed {new Date(contract.adminSignedAt!).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600">Predika Platform</p>
              {!adminSigned && isAdmin && (
                <button
                  onClick={() => handleSign('admin')}
                  disabled={signing}
                  className="mt-3 btn btn-sm btn-primary"
                >
                  {signing ? 'Signing...' : 'Sign as Admin'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contract Terms */}
        {terms.conditions && terms.conditions.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Terms & Conditions</h2>

            <div className="space-y-3">
              {terms.conditions.map((condition, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-primary font-bold">{index + 1}.</span>
                  <p className="text-gray-700">{condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
            Back to Dashboard
          </button>
          {contract.status !== 'signed' && (investorSigned || entrepreneurSigned || adminSigned) && (
            <div className="text-sm text-gray-600 py-2">
              Waiting for missing signatures...
            </div>
          )}
          {contract.status === 'signed' && (
            <div className="text-sm text-green-600 py-2 font-medium">
              ✓ All parties have signed. Contract is active.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
