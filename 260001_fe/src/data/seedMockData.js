import { mockUser, mockGroups, mockJobs } from './mockData'

/**
 * Seeds localStorage with mock data for demo/portfolio purposes
 * Call this function after login to populate with sample data
 * 
 * Usage: seedMockData()
 */
export const seedMockData = () => {
  try {
    // Store mock user
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', mockUser.token)
    
    // Store mock data - we'll use these as fallback in API calls
    localStorage.setItem('mock_groups', JSON.stringify(mockGroups))
    localStorage.setItem('mock_jobs', JSON.stringify(mockJobs))
    
    console.log('✓ Mock data seeded successfully')
    console.log(`✓ User: ${mockUser.email}`)
    console.log(`✓ Groups: ${mockGroups.map(g => g.name).join(', ')}`)
    console.log(`✓ Jobs: ${mockJobs.length} applications loaded`)
    
    return true
  } catch (error) {
    console.error('Failed to seed mock data:', error)
    return false
  }
}

/**
 * Clears all mock data from localStorage
 */
export const clearMockData = () => {
  try {
    localStorage.removeItem('mock_groups')
    localStorage.removeItem('mock_jobs')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('✓ Mock data cleared')
    return true
  } catch (error) {
    console.error('Failed to clear mock data:', error)
    return false
  }
}

/**
 * Gets mock data from localStorage
 */
export const getMockData = () => {
  return {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    groups: JSON.parse(localStorage.getItem('mock_groups') || '[]'),
    jobs: JSON.parse(localStorage.getItem('mock_jobs') || '[]')
  }
}
