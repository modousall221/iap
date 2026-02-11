import { useState, useEffect } from 'react'
import api from '../../services/api'

interface KYCDocument {
  id: string
  documentType: string
  fileName: string
  status: string
}

interface KYCQueueItem {
  user: {
    id: string
    email: string
    role: string
  }
  documents: KYCDocument[]
}

export default function KYCApprovalQueue() {
  const [queue, setQueue] = useState<KYCQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})
  const [showRejectForm, setShowRejectForm] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchKYCQueue()
  }, [])

  const fetchKYCQueue = async () => {
    try {
      const response = await api.get('/kyc/queue')
      setQueue(response.data.queue || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch KYC queue:', error)
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    setProcessing(userId)
    try {
      await api.post(`/kyc/approve/${userId}`)
      setQueue(queue.filter(item => item.user.id !== userId))
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    const reason = rejectionReason[userId] || 'Documents do not meet requirements'
    setProcessing(userId)

    try {
      await api.post(`/kyc/reject/${userId}`, {
        rejectionReason: reason,
      })
      setQueue(queue.filter(item => item.user.id !== userId))
      setShowRejectForm({ ...showRejectForm, [userId]: false })
      setRejectionReason({ ...rejectionReason, [userId]: '' })
    } catch (error) {
      console.error('Rejection failed:', error)
    } finally {
      setProcessing(null)
    }
  }

  const getDocumentLabel = (type: string): string => {
    const labels: Record<string, string> = {
      id: 'National ID / Passport',
      rib: 'Bank Account (RIB)',
      kbis: 'Business Registration (KBIS)',
      proof_of_address: 'Proof of Address',
    }
    return labels[type] || type
  }

  if (loading) {
    return <div className="container py-12 text-center">Loading...</div>
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">KYC Approval Queue</h1>
        <p className="text-gray-600 mb-8">
          Review and approve pending KYC submissions ({queue.length} pending)
        </p>

        {queue.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No pending KYC approvals</p>
          </div>
        ) : (
          <div className="space-y-6">
            {queue.map((item) => (
              <div key={item.user.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{item.user.email}</h3>
                    <p className="text-sm text-gray-500 capitalize">Role: {item.user.role}</p>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Uploaded Documents:</h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {item.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {getDocumentLabel(doc.documentType)}
                          </p>
                          <p className="text-sm text-gray-500">{doc.fileName}</p>
                        </div>
                        <a
                          href={doc.id}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Form (conditional) */}
                {showRejectForm[item.user.id] && (
                  <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <textarea
                      value={rejectionReason[item.user.id] || ''}
                      onChange={(e) => setRejectionReason({
                        ...rejectionReason,
                        [item.user.id]: e.target.value,
                      })}
                      placeholder="Explain why the documents are rejected..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(item.user.id)}
                    disabled={processing === item.user.id}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {processing === item.user.id ? 'Processing...' : 'Approve KYC'}
                  </button>

                  {!showRejectForm[item.user.id] ? (
                    <button
                      onClick={() => setShowRejectForm({
                        ...showRejectForm,
                        [item.user.id]: true,
                      })}
                      className="flex-1 btn btn-outline"
                    >
                      Request Resubmission
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReject(item.user.id)}
                        disabled={processing === item.user.id}
                        className="flex-1 btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                      >
                        {processing === item.user.id ? 'Processing...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => setShowRejectForm({
                          ...showRejectForm,
                          [item.user.id]: false,
                        })}
                        className="flex-1 btn btn-outline"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
