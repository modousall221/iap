import { useState, useEffect } from 'react'
import api from '../../services/api'

interface KYCDocument {
  id: string
  documentType: string
  status: string
  fileName: string
}

export default function KYCUpload() {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState<string>('id')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    try {
      const response = await api.get('/kyc/status')
      setDocuments(response.data.documents || [])
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch KYC status:', err)
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must not exceed 5MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed')
        return
      }
      setError(null)
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    setUploadingFile(selectedType)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('documentType', selectedType)

      const response = await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.success) {
        setSuccess('Document uploaded successfully')
        setSelectedFile(null)
        setSelectedType('id')
        setTimeout(() => {
          setSuccess(null)
          fetchKYCStatus()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploadingFile(null)
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return <div className="container py-12 text-center">Loading...</div>
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-gray-600 mb-8">
          Please upload the required documents to complete your verification
        </p>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6">Upload Documents</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                id="docType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input w-full"
              >
                <option value="id">National ID / Passport</option>
                <option value="rib">Bank Account (RIB)</option>
                <option value="kbis">Business Registration (KBIS)</option>
                <option value="proof_of_address">Proof of Address</option>
              </select>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="input w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. Accepted: JPEG, PNG, PDF
              </p>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Selected file: <strong>{selectedFile.name}</strong>
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || !!uploadingFile}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {uploadingFile ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Documents Status */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Uploaded Documents</h2>

          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getDocumentLabel(doc.documentType)}
                    </p>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">KYC Required Documents</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ National ID or Passport</li>
            <li>✓ Bank account details (RIB)</li>
            <li>✓ Proof of address (utility bill, etc.)</li>
            <li>✓ For businesses: Business registration (KBIS)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
