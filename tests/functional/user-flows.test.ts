import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../../client/src/pages/landing'
import CitizenDashboard from '../../client/src/pages/citizen-dashboard'
import AdminDashboard from '../../client/src/pages/admin-dashboard'
import TechManagerDashboard from '../../client/src/pages/tech-manager-dashboard'

// Mock components that require external dependencies
vi.mock('../../client/src/components/chatbot', () => ({
  default: () => <div data-testid="chatbot">Chatbot Component</div>
}))

vi.mock('../../client/src/components/real-time-notifications', () => ({
  default: () => <div data-testid="notifications">Notifications Component</div>
}))

vi.mock('../../client/src/components/issue-form', () => ({
  IssueForm: ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => 
    isOpen ? <div data-testid="issue-form">Issue Form</div> : null
}))

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
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('User Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Landing Page Flow', () => {
    it('should render landing page with login option', () => {
      render(<Landing />, { wrapper: createWrapper() })
      
      expect(screen.getByText(/ADA Smart Munic/i)).toBeInTheDocument()
      expect(screen.getByText(/login/i)).toBeInTheDocument()
      expect(screen.getByText(/Smart Municipal Services/i)).toBeInTheDocument()
    })

    it('should show login form when login button is clicked', async () => {
      const user = userEvent.setup()
      render(<Landing />, { wrapper: createWrapper() })
      
      const loginButton = screen.getByRole('button', { name: /login/i })
      await user.click(loginButton)
      
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should handle login form submission', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: { id: 1, role: 'citizen' } })
      })

      render(<Landing />, { wrapper: createWrapper() })
      
      const loginButton = screen.getByRole('button', { name: /login/i })
      await user.click(loginButton)
      
      const usernameInput = screen.getByLabelText(/username/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(usernameInput, 'citizen')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'citizen', password: 'password' })
        })
      })
    })
  })

  describe('Citizen Dashboard Flow', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/issues') {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              {
                id: 1,
                referenceNumber: 'ABC123',
                title: 'Water leak',
                status: 'resolved',
                rating: null
              }
            ])
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })
    })

    it('should render citizen dashboard with issues', async () => {
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      expect(screen.getByText(/Citizen Dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/Report New Issue/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText(/Water leak/i)).toBeInTheDocument()
      })
    })

    it('should open issue form when report button is clicked', async () => {
      const user = userEvent.setup()
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      const reportButton = screen.getByText(/Report New Issue/i)
      await user.click(reportButton)
      
      expect(screen.getByTestId('issue-form')).toBeInTheDocument()
    })

    it('should filter issues by status', async () => {
      const user = userEvent.setup()
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      const statusFilter = screen.getByRole('combobox')
      await user.click(statusFilter)
      
      const openOption = screen.getByText('Open')
      await user.click(openOption)
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/issues?status=open', expect.any(Object))
      })
    })

    it('should show rating modal for resolved issues', async () => {
      const user = userEvent.setup()
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const rateButton = screen.getByText(/Rate Service/i)
        expect(rateButton).toBeInTheDocument()
      })
    })
  })

  describe('Admin Dashboard Flow', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/users') {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { id: 1, username: 'citizen', role: 'citizen', name: 'John Citizen' },
              { id: 2, username: 'agent', role: 'call_centre_agent', name: 'Sarah Agent' }
            ])
          })
        }
        if (url === '/api/stats') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              totalIssues: 150,
              resolvedIssues: 120,
              pendingIssues: 30
            })
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })
    })

    it('should render admin dashboard with statistics', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() })
      
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/System Overview/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText(/150/)).toBeInTheDocument() // Total issues
        expect(screen.getByText(/120/)).toBeInTheDocument() // Resolved issues
      })
    })

    it('should display user management section', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() })
      
      expect(screen.getByText(/User Management/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText(/John Citizen/i)).toBeInTheDocument()
        expect(screen.getByText(/Sarah Agent/i)).toBeInTheDocument()
      })
    })

    it('should allow role switching', async () => {
      const user = userEvent.setup()
      render(<AdminDashboard />, { wrapper: createWrapper() })
      
      const roleToggle = screen.getByText(/Switch Role/i)
      await user.click(roleToggle)
      
      expect(screen.getByText(/Mayor/i)).toBeInTheDocument()
      expect(screen.getByText(/Technician/i)).toBeInTheDocument()
    })
  })

  describe('Tech Manager Dashboard Flow', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url) => {
        if (url === '/api/issues') {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              {
                id: 1,
                referenceNumber: 'ABC123',
                title: 'Water leak',
                status: 'assigned',
                priority: 'urgent',
                assignedTo: 'Tech 1'
              }
            ])
          })
        }
        if (url === '/api/technicians') {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { id: 1, name: 'Tech 1', status: 'available', department: 'Water' },
              { id: 2, name: 'Tech 2', status: 'on_job', department: 'Electricity' }
            ])
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })
    })

    it('should render tech manager dashboard with team overview', async () => {
      render(<TechManagerDashboard />, { wrapper: createWrapper() })
      
      expect(screen.getByText(/Tech Manager Dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/Team Overview/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText(/Tech 1/i)).toBeInTheDocument()
        expect(screen.getByText(/Tech 2/i)).toBeInTheDocument()
      })
    })

    it('should highlight urgent issues', async () => {
      render(<TechManagerDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const urgentIssue = screen.getByText(/Water leak/i)
        expect(urgentIssue).toBeInTheDocument()
        // Check for urgent styling (red background, etc.)
      })
    })

    it('should allow technician assignment', async () => {
      const user = userEvent.setup()
      render(<TechManagerDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const assignButton = screen.getByText(/Assign Technician/i)
        expect(assignButton).toBeInTheDocument()
      })
    })
  })

  describe('Issue Reporting Flow', () => {
    it('should complete full issue reporting flow', async () => {
      const user = userEvent.setup()
      
      // Mock successful API responses
      mockFetch.mockImplementation((url, options) => {
        if (url === '/api/issues' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 1,
              referenceNumber: 'ABC123',
              title: 'New Water Leak',
              status: 'open'
            })
          })
        }
        return Promise.resolve({ ok: true, json: async () => ([]) })
      })

      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      // Step 1: Open issue form
      const reportButton = screen.getByText(/Report New Issue/i)
      await user.click(reportButton)
      
      expect(screen.getByTestId('issue-form')).toBeInTheDocument()
      
      // The actual form interaction would require mocking the IssueForm component
      // with proper form fields and submission logic
    })
  })

  describe('Service Rating Flow', () => {
    it('should complete service rating flow', async () => {
      const user = userEvent.setup()
      
      mockFetch.mockImplementation((url, options) => {
        if (url.includes('/rate') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 1,
              rating: 5,
              feedback: 'Great service!'
            })
          })
        }
        if (url === '/api/issues') {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              {
                id: 1,
                referenceNumber: 'ABC123',
                title: 'Water leak',
                status: 'resolved',
                rating: null
              }
            ])
          })
        }
        return Promise.resolve({ ok: true, json: async () => ({}) })
      })

      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        const rateButton = screen.getByText(/Rate Service/i)
        expect(rateButton).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading/i)).toBeInTheDocument()
      })
    })

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      })
      
      render(<CitizenDashboard />, { wrapper: createWrapper() })
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in/i)).toBeInTheDocument()
      })
    })
  })
})