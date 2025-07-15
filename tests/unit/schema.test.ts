import { describe, it, expect } from 'vitest'
import { 
  insertUserSchema, 
  insertIssueSchema, 
  insertTechnicianSchema,
  insertPaymentSchema 
} from '@shared/schema'

describe('Schema Validation Tests', () => {
  describe('User Schema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '0821234567',
        role: 'citizen',
        municipalityAccountNo: 'ACC123456'
      }

      const result = insertUserSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject invalid user data', () => {
      const invalidUser = {
        username: '', // empty username
        password: 'pass',
        name: 'Test User',
        role: 'invalid_role'
      }

      const result = insertUserSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
    })

    it('should require username and password', () => {
      const incompleteUser = {
        name: 'Test User',
        email: 'test@example.com'
      }

      const result = insertUserSchema.safeParse(incompleteUser)
      expect(result.success).toBe(false)
    })
  })

  describe('Issue Schema', () => {
    it('should validate valid issue data', () => {
      const validIssue = {
        title: 'Water leak on Main Street',
        description: 'There is a major water leak causing flooding',
        category: 'water_sanitation',
        priority: 'high',
        status: 'open',
        location: '123 Main Street, Cape Town',
        ward: 'Ward 1',
        reporterName: 'John Doe',
        reporterPhone: '0821234567',
        photos: ['photo1.jpg', 'photo2.jpg']
      }

      const result = insertIssueSchema.safeParse(validIssue)
      expect(result.success).toBe(true)
    })

    it('should reject issue without required fields', () => {
      const invalidIssue = {
        description: 'Missing title and category'
      }

      const result = insertIssueSchema.safeParse(invalidIssue)
      expect(result.success).toBe(false)
    })

    it('should validate issue categories', () => {
      const issueWithInvalidCategory = {
        title: 'Test Issue',
        description: 'Test description',
        category: 'invalid_category',
        location: 'Test Location'
      }

      const result = insertIssueSchema.safeParse(issueWithInvalidCategory)
      expect(result.success).toBe(false)
    })
  })

  describe('Technician Schema', () => {
    it('should validate valid technician data', () => {
      const validTechnician = {
        name: 'John Technician',
        phone: '0821234567',
        email: 'john@municipality.gov.za',
        department: 'Water & Sanitation',
        skills: ['Plumbing', 'Pipe Repair'],
        status: 'available',
        currentLocation: 'Main Street depot',
        latitude: '-33.9249',
        longitude: '18.4241',
        teamId: 1,
        performanceRating: 4,
        completedIssues: 25,
        avgResolutionTime: 18
      }

      const result = insertTechnicianSchema.safeParse(validTechnician)
      expect(result.success).toBe(true)
    })

    it('should require name, phone, and department', () => {
      const incompleteTechnician = {
        email: 'john@municipality.gov.za'
      }

      const result = insertTechnicianSchema.safeParse(incompleteTechnician)
      expect(result.success).toBe(false)
    })
  })

  describe('Payment Schema', () => {
    it('should validate valid payment data', () => {
      const validPayment = {
        type: 'water',
        amount: 15000, // R150.00 in cents
        dueDate: new Date('2024-01-31'),
        status: 'pending',
        accountNumber: 'ACC123456',
        description: 'Monthly water bill'
      }

      const result = insertPaymentSchema.safeParse(validPayment)
      expect(result.success).toBe(true)
    })

    it('should require type and amount', () => {
      const incompletePayment = {
        dueDate: new Date(),
        status: 'pending'
      }

      const result = insertPaymentSchema.safeParse(incompletePayment)
      expect(result.success).toBe(false)
    })

    it('should validate payment types', () => {
      const paymentWithInvalidType = {
        type: 'invalid_type',
        amount: 10000,
        dueDate: new Date()
      }

      const result = insertPaymentSchema.safeParse(paymentWithInvalidType)
      expect(result.success).toBe(false)
    })
  })
})