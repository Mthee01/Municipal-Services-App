import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DatabaseStorage } from '../../server/database-storage'
import type { Issue, User, Technician } from '@shared/schema'

// Mock the database module
vi.mock('../../server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}))

describe('Database Storage Tests', () => {
  let storage: DatabaseStorage
  
  beforeEach(() => {
    storage = new DatabaseStorage()
    vi.clearAllMocks()
  })

  describe('User Management', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'citizen',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Mock the database insert operation
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser])
        })
      })

      const result = await storage.createUser({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'citizen'
      })

      expect(result).toBeDefined()
      expect(result.username).toBe('testuser')
    })

    it('should retrieve user by ID', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'citizen'
      }

      const result = await storage.getUser(1)
      expect(result).toBeDefined()
    })

    it('should retrieve user by username', async () => {
      const result = await storage.getUserByUsername('testuser')
      expect(result).toBeDefined()
    })

    it('should update user information', async () => {
      const updates = {
        name: 'Updated User',
        email: 'updated@example.com'
      }

      const result = await storage.updateUser(1, updates)
      expect(result).toBeDefined()
    })

    it('should delete user', async () => {
      const result = await storage.deleteUser(1)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Issue Management', () => {
    it('should create a new issue', async () => {
      const mockIssue = {
        title: 'Water leak',
        description: 'Major water leak on Main Street',
        category: 'water_sanitation',
        priority: 'high',
        status: 'open',
        location: '123 Main Street',
        ward: 'Ward 1',
        reporterName: 'John Doe',
        reporterPhone: '0821234567'
      }

      const result = await storage.createIssue(mockIssue)
      expect(result).toBeDefined()
      expect(result.referenceNumber).toBeDefined()
      expect(result.referenceNumber).toMatch(/^[A-Z0-9]{6}$/)
    })

    it('should retrieve all issues', async () => {
      const result = await storage.getIssues()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should retrieve issue by ID', async () => {
      const result = await storage.getIssue(1)
      expect(result).toBeDefined()
    })

    it('should update issue status', async () => {
      const updates = {
        status: 'resolved',
        resolvedAt: new Date()
      }

      const result = await storage.updateIssue(1, updates)
      expect(result).toBeDefined()
    })

    it('should filter issues by status', async () => {
      const result = await storage.getIssuesByStatus('open')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter issues by category', async () => {
      const result = await storage.getIssuesByCategory('water_sanitation')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter issues by ward', async () => {
      const result = await storage.getIssuesByWard('Ward 1')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter issues by technician', async () => {
      const result = await storage.getIssuesByTechnician(1)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Technician Management', () => {
    it('should create a new technician', async () => {
      const mockTechnician = {
        name: 'John Technician',
        phone: '0821234567',
        email: 'john@municipality.gov.za',
        department: 'Water & Sanitation',
        skills: ['Plumbing', 'Pipe Repair'],
        status: 'available',
        currentLocation: 'Main Street depot',
        latitude: '-33.9249',
        longitude: '18.4241'
      }

      const result = await storage.createTechnician(mockTechnician)
      expect(result).toBeDefined()
      expect(result.name).toBe('John Technician')
    })

    it('should retrieve all technicians', async () => {
      const result = await storage.getTechnicians()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should retrieve technician by ID', async () => {
      const result = await storage.getTechnician(1)
      expect(result).toBeDefined()
    })

    it('should filter technicians by department', async () => {
      const result = await storage.getTechniciansByDepartment('Water & Sanitation')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter technicians by status', async () => {
      const result = await storage.getTechniciansByStatus('available')
      expect(Array.isArray(result)).toBe(true)
    })

    it('should update technician information', async () => {
      const updates = {
        status: 'on_job',
        currentLocation: 'Field location'
      }

      const result = await storage.updateTechnician(1, updates)
      expect(result).toBeDefined()
    })

    it('should assign technician to issue', async () => {
      const result = await storage.assignTechnicianToIssue(1, 1)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Issue Notes Management', () => {
    it('should create issue note', async () => {
      const mockNote = {
        issueId: 1,
        note: 'Called citizen for more details',
        noteType: 'follow_up',
        createdBy: 'agent',
        createdByRole: 'call_centre_agent'
      }

      const result = await storage.createIssueNote(mockNote)
      expect(result).toBeDefined()
      expect(result.note).toBe('Called citizen for more details')
    })

    it('should retrieve issue notes', async () => {
      const result = await storage.getIssueNotes(1)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Issue Escalations Management', () => {
    it('should create issue escalation', async () => {
      const mockEscalation = {
        issueId: 1,
        escalatedBy: 'agent',
        escalatedByRole: 'call_centre_agent',
        escalationReason: 'Urgent repair needed',
        priority: 'urgent'
      }

      const result = await storage.createIssueEscalation(mockEscalation)
      expect(result).toBeDefined()
      expect(result.escalationReason).toBe('Urgent repair needed')
    })

    it('should retrieve issue escalations', async () => {
      const result = await storage.getIssueEscalations(1)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Statistics and Analytics', () => {
    it('should generate municipality stats', async () => {
      const result = await storage.getMunicipalityStats()
      expect(result).toBeDefined()
      expect(result.totalIssues).toBeDefined()
      expect(result.resolvedIssues).toBeDefined()
      expect(result.pendingIssues).toBeDefined()
    })

    it('should generate department stats', async () => {
      const result = await storage.getDepartmentStats('Water & Sanitation')
      expect(result).toBeDefined()
      expect(result.totalTechnicians).toBeDefined()
      expect(result.availableTechnicians).toBeDefined()
    })

    it('should generate technician performance', async () => {
      const result = await storage.getTechnicianPerformance()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should generate ward statistics', async () => {
      const result = await storage.getWardStats('Ward 1')
      expect(result).toBeDefined()
      expect(result.totalIssues).toBeDefined()
    })
  })
})