import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IssueCard } from '../../client/src/components/issue-card'
import { IssueForm } from '../../client/src/components/issue-form'
import { PaymentSection } from '../../client/src/components/payment-section'
import { VoucherSection } from '../../client/src/components/voucher-section'
import { LanguageSelector } from '../../client/src/components/language-selector'
import { RoleToggle } from '../../client/src/components/role-toggle'

// Mock API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('IssueCard Component', () => {
    const mockIssue = {
      id: 1,
      referenceNumber: 'ABC123',
      title: 'Water leak on Main Street',
      description: 'Large water leak causing street flooding',
      category: 'water_sanitation',
      priority: 'high',
      status: 'open',
      location: '123 Main Street, Cape Town',
      ward: 'Ward 1',
      reporterName: 'John Doe',
      reporterPhone: '0821234567',
      assignedTo: null,
      photos: ['photo1.jpg'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      resolvedAt: null,
      rating: null,
      feedback: null
    }

    it('should render issue card with all details', () => {
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Water leak on Main Street')).toBeInTheDocument()
      expect(screen.getByText('ABC123')).toBeInTheDocument()
      expect(screen.getByText('123 Main Street, Cape Town')).toBeInTheDocument()
      expect(screen.getByText('Ward 1')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display correct status badge', () => {
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      const statusBadge = screen.getByText('Open')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveClass('bg-yellow-100')
    })

    it('should display priority indicator', () => {
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      const priorityBadge = screen.getByText('High')
      expect(priorityBadge).toBeInTheDocument()
      expect(priorityBadge).toHaveClass('bg-red-100')
    })

    it('should show rating button for resolved issues', () => {
      const resolvedIssue = {
        ...mockIssue,
        status: 'resolved',
        resolvedAt: '2024-01-16T10:00:00Z'
      }
      
      render(<IssueCard issue={resolvedIssue} />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Rate Service')).toBeInTheDocument()
    })

    it('should not show rating button for open issues', () => {
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      expect(screen.queryByText('Rate Service')).not.toBeInTheDocument()
    })

    it('should display existing rating when present', () => {
      const ratedIssue = {
        ...mockIssue,
        status: 'resolved',
        rating: 5,
        feedback: 'Excellent service!'
      }
      
      render(<IssueCard issue={ratedIssue} />, { wrapper: createWrapper() })
      
      expect(screen.getByText('5/5 stars')).toBeInTheDocument()
      expect(screen.getByText('Excellent service!')).toBeInTheDocument()
    })

    it('should show photos when available', () => {
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      const photoContainer = screen.getByText('Photos (1)')
      expect(photoContainer).toBeInTheDocument()
    })

    it('should handle click events', async () => {
      const user = userEvent.setup()
      render(<IssueCard issue={mockIssue} />, { wrapper: createWrapper() })
      
      const viewButton = screen.getByText('View Details')
      await user.click(viewButton)
      
      // Details modal should open
      expect(screen.getByText('Issue Details')).toBeInTheDocument()
    })
  })

  describe('IssueForm Component', () => {
    const mockOnClose = vi.fn()

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      })
    })

    it('should render form with all fields', () => {
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Photos/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      const submitButton = screen.getByText('Submit Issue')
      await user.click(submitButton)
      
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Category is required')).toBeInTheDocument()
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('should handle form submission', async () => {
      const user = userEvent.setup()
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      await user.type(screen.getByLabelText(/Title/i), 'Test Issue')
      await user.selectOptions(screen.getByLabelText(/Category/i), 'water_sanitation')
      await user.type(screen.getByLabelText(/Description/i), 'Test description')
      await user.type(screen.getByLabelText(/Location/i), 'Test location')
      
      await user.click(screen.getByText('Submit Issue'))
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/issues', expect.objectContaining({
          method: 'POST'
        }))
      })
    })

    it('should handle GPS location', async () => {
      const user = userEvent.setup()
      
      // Mock geolocation
      const mockGeolocation = {
        getCurrentPosition: vi.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: -33.9249,
              longitude: 18.4241
            }
          })
        })
      }
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      })
      
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      const gpsButton = screen.getByTitle('Use GPS Location')
      await user.click(gpsButton)
      
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
    })

    it('should handle manual location selection', async () => {
      const user = userEvent.setup()
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      const locationButton = screen.getByTitle('Select Location')
      await user.click(locationButton)
      
      expect(screen.getByText('Select Location')).toBeInTheDocument()
      expect(screen.getByText('Cape Town CBD')).toBeInTheDocument()
    })

    it('should handle file uploads', async () => {
      const user = userEvent.setup()
      render(<IssueForm isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() })
      
      const fileInput = screen.getByLabelText(/Photos/i)
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      await user.upload(fileInput, file)
      
      expect(fileInput.files).toHaveLength(1)
      expect(fileInput.files[0]).toBe(file)
    })
  })

  describe('PaymentSection Component', () => {
    const mockPayments = [
      {
        id: 1,
        type: 'water',
        amount: 15000,
        dueDate: '2024-01-31',
        status: 'pending',
        accountNumber: 'ACC123456',
        description: 'Monthly water bill'
      },
      {
        id: 2,
        type: 'electricity',
        amount: 25000,
        dueDate: '2024-02-15',
        status: 'paid',
        accountNumber: 'ACC123456',
        description: 'Monthly electricity bill'
      }
    ]

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPayments
      })
    })

    it('should display payment list', async () => {
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('Monthly water bill')).toBeInTheDocument()
        expect(screen.getByText('Monthly electricity bill')).toBeInTheDocument()
      })
    })

    it('should display payment amounts correctly', async () => {
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('R150.00')).toBeInTheDocument()
        expect(screen.getByText('R250.00')).toBeInTheDocument()
      })
    })

    it('should show payment status badges', async () => {
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument()
        expect(screen.getByText('Paid')).toBeInTheDocument()
      })
    })

    it('should handle payment action', async () => {
      const user = userEvent.setup()
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const payButton = screen.getByText('Pay Now')
        expect(payButton).toBeInTheDocument()
      })
      
      const payButton = screen.getByText('Pay Now')
      await user.click(payButton)
      
      expect(screen.getByText('Payment Processing')).toBeInTheDocument()
    })

    it('should filter payments by type', async () => {
      const user = userEvent.setup()
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      const filterSelect = screen.getByLabelText(/Filter by type/i)
      await user.selectOptions(filterSelect, 'water')
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/payments?type=water', expect.any(Object))
      })
    })
  })

  describe('VoucherSection Component', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          voucherCode: 'VOUCHER123',
          amount: 5000,
          expiryDate: '2024-02-01'
        })
      })
    })

    it('should render voucher purchase form', () => {
      render(<VoucherSection />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Purchase Voucher')).toBeInTheDocument()
      expect(screen.getByLabelText(/Voucher Type/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument()
    })

    it('should handle voucher purchase', async () => {
      const user = userEvent.setup()
      render(<VoucherSection />, { wrapper: createWrapper() })
      
      await user.selectOptions(screen.getByLabelText(/Voucher Type/i), 'electricity')
      await user.type(screen.getByLabelText(/Amount/i), '50')
      
      await user.click(screen.getByText('Purchase Voucher'))
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/vouchers', expect.objectContaining({
          method: 'POST'
        }))
      })
    })

    it('should display voucher code after purchase', async () => {
      const user = userEvent.setup()
      render(<VoucherSection />, { wrapper: createWrapper() })
      
      await user.selectOptions(screen.getByLabelText(/Voucher Type/i), 'electricity')
      await user.type(screen.getByLabelText(/Amount/i), '50')
      await user.click(screen.getByText('Purchase Voucher'))
      
      await waitFor(() => {
        expect(screen.getByText('VOUCHER123')).toBeInTheDocument()
      })
    })

    it('should validate voucher amount', async () => {
      const user = userEvent.setup()
      render(<VoucherSection />, { wrapper: createWrapper() })
      
      await user.type(screen.getByLabelText(/Amount/i), '5') // Below minimum
      await user.click(screen.getByText('Purchase Voucher'))
      
      expect(screen.getByText('Minimum amount is R10')).toBeInTheDocument()
    })
  })

  describe('LanguageSelector Component', () => {
    it('should render language options', () => {
      render(<LanguageSelector />, { wrapper: createWrapper() })
      
      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Afrikaans')).toBeInTheDocument()
      expect(screen.getByText('isiZulu')).toBeInTheDocument()
      expect(screen.getByText('isiXhosa')).toBeInTheDocument()
    })

    it('should handle language selection', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector />, { wrapper: createWrapper() })
      
      await user.click(screen.getByText('Afrikaans'))
      
      // Language should be stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'af')
    })

    it('should load saved language preference', () => {
      localStorage.getItem.mockReturnValue('zu')
      
      render(<LanguageSelector />, { wrapper: createWrapper() })
      
      expect(screen.getByText('isiZulu')).toHaveClass('selected')
    })
  })

  describe('RoleToggle Component', () => {
    const mockUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      role: 'admin'
    }

    it('should render role options for admin', () => {
      render(<RoleToggle user={mockUser} />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Mayor')).toBeInTheDocument()
      expect(screen.getByText('Tech Manager')).toBeInTheDocument()
    })

    it('should handle role switching', async () => {
      const user = userEvent.setup()
      render(<RoleToggle user={mockUser} />, { wrapper: createWrapper() })
      
      await user.click(screen.getByText('Mayor'))
      
      // Role switch should trigger navigation
      expect(window.location.pathname).toBe('/mayor-dashboard')
    })

    it('should not show role toggle for non-admin users', () => {
      const citizenUser = { ...mockUser, role: 'citizen' }
      
      render(<RoleToggle user={citizenUser} />, { wrapper: createWrapper() })
      
      expect(screen.queryByText('Switch Role')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors in components', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load payments')).toBeInTheDocument()
      })
    })

    it('should handle loading states', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<PaymentSection />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})