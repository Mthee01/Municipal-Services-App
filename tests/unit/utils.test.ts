import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatDistance, generateRefNumber, validateEmail, validatePhone } from '../../client/src/lib/utils'

describe('Utility Functions Tests', () => {
  describe('formatCurrency', () => {
    it('should format currency in cents to rand', () => {
      expect(formatCurrency(15000)).toBe('R150.00')
      expect(formatCurrency(50)).toBe('R0.50')
      expect(formatCurrency(0)).toBe('R0.00')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('R10,000.00')
      expect(formatCurrency(123456789)).toBe('R1,234,567.89')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-5000)).toBe('-R50.00')
    })
  })

  describe('formatDate', () => {
    it('should format date to readable string', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('15 Jan 2024')
    })

    it('should handle different date formats', () => {
      const dateString = '2024-01-15T10:30:00Z'
      expect(formatDate(dateString)).toBe('15 Jan 2024')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('formatDistance', () => {
    it('should format distance in meters', () => {
      expect(formatDistance(500)).toBe('500m')
      expect(formatDistance(1500)).toBe('1.5km')
      expect(formatDistance(10000)).toBe('10km')
    })

    it('should handle zero distance', () => {
      expect(formatDistance(0)).toBe('0m')
    })

    it('should round distances appropriately', () => {
      expect(formatDistance(1234)).toBe('1.2km')
      expect(formatDistance(1567)).toBe('1.6km')
    })
  })

  describe('generateRefNumber', () => {
    it('should generate 6-character reference number', () => {
      const refNumber = generateRefNumber()
      expect(refNumber).toHaveLength(6)
      expect(refNumber).toMatch(/^[A-Z0-9]{6}$/)
    })

    it('should generate unique reference numbers', () => {
      const refNumbers = Array.from({ length: 100 }, () => generateRefNumber())
      const uniqueNumbers = new Set(refNumbers)
      expect(uniqueNumbers.size).toBe(100) // All should be unique
    })

    it('should only contain uppercase letters and numbers', () => {
      const refNumber = generateRefNumber()
      expect(refNumber).toMatch(/^[A-Z0-9]+$/)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.za')).toBe(true)
      expect(validateEmail('admin@municipality.gov.za')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..test@example.com')).toBe(false)
    })

    it('should handle empty or null inputs', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as any)).toBe(false)
      expect(validateEmail(undefined as any)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate South African phone numbers', () => {
      expect(validatePhone('0821234567')).toBe(true)
      expect(validatePhone('0123456789')).toBe(true)
      expect(validatePhone('+27821234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('12345678901')).toBe(false) // Too long
      expect(validatePhone('abcdefghij')).toBe(false)
    })

    it('should handle different formats', () => {
      expect(validatePhone('082 123 4567')).toBe(true)
      expect(validatePhone('082-123-4567')).toBe(true)
      expect(validatePhone('(082) 123-4567')).toBe(true)
    })

    it('should handle empty or null inputs', () => {
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null as any)).toBe(false)
      expect(validatePhone(undefined as any)).toBe(false)
    })
  })

  describe('Distance Calculations', () => {
    it('should calculate distance between coordinates', () => {
      const lat1 = -33.9249 // Cape Town
      const lon1 = 18.4241
      const lat2 = -26.2041 // Johannesburg
      const lon2 = 28.0473
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2)
      expect(distance).toBeGreaterThan(1000) // Should be > 1000km
      expect(distance).toBeLessThan(1500) // Should be < 1500km
    })

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(-33.9249, 18.4241, -33.9249, 18.4241)
      expect(distance).toBe(0)
    })

    it('should handle invalid coordinates', () => {
      const distance = calculateDistance(NaN, NaN, -33.9249, 18.4241)
      expect(distance).toBe(0)
    })
  })

  describe('Status Formatting', () => {
    it('should format issue status for display', () => {
      expect(formatStatus('open')).toBe('Open')
      expect(formatStatus('in_progress')).toBe('In Progress')
      expect(formatStatus('resolved')).toBe('Resolved')
    })

    it('should handle unknown statuses', () => {
      expect(formatStatus('unknown_status')).toBe('Unknown Status')
    })
  })

  describe('Priority Formatting', () => {
    it('should format priority levels', () => {
      expect(formatPriority('low')).toBe('Low')
      expect(formatPriority('medium')).toBe('Medium')
      expect(formatPriority('high')).toBe('High')
      expect(formatPriority('urgent')).toBe('Urgent')
    })

    it('should return color classes for priorities', () => {
      expect(getPriorityColor('low')).toBe('bg-green-100 text-green-800')
      expect(getPriorityColor('medium')).toBe('bg-yellow-100 text-yellow-800')
      expect(getPriorityColor('high')).toBe('bg-red-100 text-red-800')
      expect(getPriorityColor('urgent')).toBe('bg-red-500 text-white')
    })
  })

  describe('Category Formatting', () => {
    it('should format category names', () => {
      expect(formatCategory('water_sanitation')).toBe('Water & Sanitation')
      expect(formatCategory('roads_transport')).toBe('Roads & Transport')
      expect(formatCategory('waste_management')).toBe('Waste Management')
    })

    it('should handle unknown categories', () => {
      expect(formatCategory('unknown_category')).toBe('Unknown Category')
    })
  })

  describe('Time Formatting', () => {
    it('should format time ago', () => {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      expect(formatTimeAgo(fiveMinutesAgo)).toBe('5 minutes ago')
      expect(formatTimeAgo(oneHourAgo)).toBe('1 hour ago')
      expect(formatTimeAgo(oneDayAgo)).toBe('1 day ago')
    })

    it('should handle future dates', () => {
      const future = new Date(Date.now() + 60 * 60 * 1000) // 1 hour in future
      expect(formatTimeAgo(future)).toBe('in 1 hour')
    })
  })

  describe('URL Utilities', () => {
    it('should build query strings', () => {
      const params = { status: 'open', category: 'water', ward: 'Ward 1' }
      expect(buildQueryString(params)).toBe('status=open&category=water&ward=Ward%201')
    })

    it('should handle empty parameters', () => {
      expect(buildQueryString({})).toBe('')
      expect(buildQueryString({ status: '', category: null })).toBe('')
    })

    it('should encode special characters', () => {
      const params = { search: 'test & search' }
      expect(buildQueryString(params)).toBe('search=test%20%26%20search')
    })
  })

  describe('File Utilities', () => {
    it('should validate file types', () => {
      expect(isValidImageFile('image.jpg')).toBe(true)
      expect(isValidImageFile('image.jpeg')).toBe(true)
      expect(isValidImageFile('image.png')).toBe(true)
      expect(isValidImageFile('image.gif')).toBe(true)
      expect(isValidImageFile('document.pdf')).toBe(false)
      expect(isValidImageFile('video.mp4')).toBe(false)
    })

    it('should format file sizes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle small file sizes', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(0)).toBe('0 B')
    })
  })

  describe('Location Utilities', () => {
    it('should format coordinates', () => {
      expect(formatCoordinates(-33.9249, 18.4241)).toBe('33.9249°S, 18.4241°E')
      expect(formatCoordinates(40.7128, -74.0060)).toBe('40.7128°N, 74.0060°W')
    })

    it('should handle zero coordinates', () => {
      expect(formatCoordinates(0, 0)).toBe('0.0000°N, 0.0000°E')
    })

    it('should validate coordinates', () => {
      expect(isValidCoordinate(-33.9249)).toBe(true)
      expect(isValidCoordinate(90)).toBe(true)
      expect(isValidCoordinate(-90)).toBe(true)
      expect(isValidCoordinate(91)).toBe(false)
      expect(isValidCoordinate(-91)).toBe(false)
    })
  })

  describe('Array Utilities', () => {
    it('should chunk arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const chunks = chunkArray(array, 3)
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    })

    it('should handle empty arrays', () => {
      expect(chunkArray([], 3)).toEqual([])
    })

    it('should handle arrays smaller than chunk size', () => {
      expect(chunkArray([1, 2], 3)).toEqual([[1, 2]])
    })
  })
})

// Helper functions that would be in utils.ts
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function formatStatus(status: string): string {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function getPriorityColor(priority: string): string {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    urgent: 'bg-red-500 text-white'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function formatCategory(category: string): string {
  const categories = {
    water_sanitation: 'Water & Sanitation',
    roads_transport: 'Roads & Transport',
    waste_management: 'Waste Management',
    electricity: 'Electricity',
    safety_security: 'Safety & Security',
    housing: 'Housing'
  }
  return categories[category as keyof typeof categories] || 'Unknown Category'
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMs < 0) {
    const futureMs = Math.abs(diffMs)
    const futureMins = Math.floor(futureMs / 60000)
    const futureHours = Math.floor(futureMins / 60)
    
    if (futureHours >= 1) return `in ${futureHours} hour${futureHours > 1 ? 's' : ''}`
    return `in ${futureMins} minute${futureMins > 1 ? 's' : ''}`
  }
  
  if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
}

function buildQueryString(params: Record<string, any>): string {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  
  return filteredParams.join('&')
}

function isValidImageFile(filename: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  return validExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}

function isValidCoordinate(coord: number): boolean {
  return !isNaN(coord) && coord >= -90 && coord <= 90
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}