'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiCheck, FiRefreshCw, FiMail, FiUserPlus, FiTrash2, FiEdit, FiSave, FiSearch } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import api from '@/utils/axios'

const CandidatePool = () => {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobGroupId = params?.jobGroupId // <-- Correct way to get it in App Router

  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [bulkAction, setBulkAction] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    enrolled: 0,
    rejected: 0
  })

  const [filters, setFilters] = useState({
    status: '',
    skills: [],
    minExperience: null,
    maxExperience: null,
    minAcademicPercentage: null,
    maxAcademicPercentage: null,
    willingToRelocate: null
  })

  const [sortBy, setSortBy] = useState('totalScore')
  const [order, setOrder] = useState('desc')

  useEffect(() => {
    if (!jobGroupId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [candidatesRes, statsRes] = await Promise.all([
          api.post(`/candidatePool/jobgroup/${jobGroupId}/advanced-selection`, {
            filters,
            sortBy,
            order,
            page,
            limit,
            searchQuery
          }),
          api.get(`/candidatePool/jobgroup/${jobGroupId}/stats`)
        ])

        setCandidates(candidatesRes.data.candidates || [])
        setTotal(candidatesRes.data.total || 0)
        setStats(statsRes.data || {})
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobGroupId, filters, sortBy, order, page, limit, searchQuery])



  // Handle bulk action
  const handleBulkAction = async (action) => {
    if (selectedCandidates.length === 0) return

    try {
      await api.put('/candidatePool/bulk-update', {
        poolIds: selectedCandidates,
        status: action
      })

      // Refresh data
      setSelectedCandidates([])
      setBulkAction(null)
      // Trigger a refresh - consider a more efficient method if possible
      router.refresh()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      // Show error to user
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      enrolled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    )
  }

  // Skill chip component
  const SkillChip = ({ skill }) => (
    <span className="inline-flex items-center px-2 py-1 mr-1 mb-1 text-xs font-medium rounded-md bg-gray-900 text-gray-100">
      {skill}
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Candidate Pool</h1>
          <div className="flex space-x-4">
            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center">
              <FiUserPlus className="mr-2" /> Add Candidate
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center">
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Total Candidates</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Shortlisted</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.shortlisted}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Enrolled</h3>
            <p className="text-2xl font-bold text-green-600">{stats.enrolled}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="text-gray-500 text-sm font-medium">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                <FiFilter className="mr-2" />
                Filters
                {filtersOpen ? (
                  <FiChevronUp className="ml-2" />
                ) : (
                  <FiChevronDown className="ml-2" />
                )}
              </button>
              <select
                value={`${sortBy}:${order}`}
                onChange={(e) => {
                  const [newSortBy, newOrder] = e.target.value.split(':')
                  setSortBy(newSortBy)
                  setOrder(newOrder)
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                <option value="totalScore:desc">Score (High to Low)</option>
                <option value="totalScore:asc">Score (Low to High)</option>
                <option value="candidate.experienceYears:desc">Experience (High to Low)</option>
                <option value="candidate.experienceYears:asc">Experience (Low to High)</option>
                <option value="candidate.academicPercentage:desc">Education (High to Low)</option>
                <option value="candidate.academicPercentage:asc">Education (Low to High)</option>
                <option value="updatedAt:desc">Recently Updated</option>
                <option value="updatedAt:asc">Oldest Updated</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minExperience || ''}
                        onChange={(e) => setFilters({ ...filters, minExperience: e.target.value ? parseInt(e.target.value) : null })}
                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxExperience || ''}
                        onChange={(e) => setFilters({ ...filters, maxExperience: e.target.value ? parseInt(e.target.value) : null })}
                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education (%)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minAcademicPercentage || ''}
                        onChange={(e) => setFilters({ ...filters, minAcademicPercentage: e.target.value ? parseFloat(e.target.value) : null })}
                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxAcademicPercentage || ''}
                        onChange={(e) => setFilters({ ...filters, maxAcademicPercentage: e.target.value ? parseFloat(e.target.value) : null })}
                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({
                      status: '',
                      skills: [],
                      minExperience: null,
                      maxExperience: null,
                      minAcademicPercentage: null,
                      maxAcademicPercentage: null,
                      willingToRelocate: null
                    })}
                    className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <FiX className="mr-2" /> Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCandidates.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 text-white py-3 px-4 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <FiCheck className="mr-2" />
              <span>{selectedCandidates.length} selected</span>
            </div>
            <div className="flex space-x-2">
              <select
                value={bulkAction || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction(e.target.value)
                  }
                }}
                className="bg-gray-800 text-white border-none rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                <option value="">Bulk Actions</option>
                <option value="shortlisted">Shortlist</option>
                <option value="enrolled">Enroll</option>
                <option value="rejected">Reject</option>
              </select>
              <button
                onClick={() => setSelectedCandidates([])}
                className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md flex items-center"
              >
                <FiX className="mr-1" /> Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Candidate List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <motion.li 
                  key={candidate._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`px-6 py-4 hover:bg-gray-50 ${selectedCandidates.includes(candidate._id) ? 'bg-gray-100' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate._id)}
                        onChange={() => toggleCandidateSelection(candidate._id)}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {candidate.candidate?.name || 'Unknown Candidate'}
                            <span className="ml-2">
                              <StatusBadge status={candidate.status} />
                            </span>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {candidate.candidate?.currentRole || 'No role specified'} • {candidate.candidate?.experienceYears || '0'} years experience
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Score: <span className="text-gray-600">{candidate.totalScore?.toFixed(1) || 'N/A'}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {candidate.candidate?.location || 'Location not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-wrap">
                          {candidate.candidate?.skills?.slice(0, 5).map((skill, index) => (
                            <SkillChip key={index} skill={skill} />
                          ))}
                          {candidate.candidate?.skills?.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-800">
                              +{candidate.candidate.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => {
                          // Implement view/edit functionality
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Implement email functionality
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <FiMail className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * limit >= total}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page * limit >= total ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> candidates
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">First</span>
                    <FiChevronDown className="h-5 w-5 transform rotate-90" />
                  </button>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronDown className="h-5 w-5 transform rotate-90" />
                  </button>
                  {Array.from({ length: Math.min(5, Math.ceil(total / limit)) }).map((_, i) => {
                    const pageNum = page <= 3 
                      ? i + 1 
                      : page >= Math.ceil(total / limit) - 2 
                        ? Math.ceil(total / limit) - 4 + i 
                        : page - 2 + i
                    if (pageNum < 1 || pageNum > Math.ceil(total / limit)) return null
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum ? 'z-10 bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * limit >= total}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${page * limit >= total ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronDown className="h-5 w-5 transform -rotate-90" />
                  </button>
                  <button
                    onClick={() => setPage(Math.ceil(total / limit))}
                    disabled={page === Math.ceil(total / limit)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === Math.ceil(total / limit) ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Last</span>
                    <FiChevronDown className="h-5 w-5 transform -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}
export default CandidatePool