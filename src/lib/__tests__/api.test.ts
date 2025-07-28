import { api } from '../api'

// Create a proper mock for fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = { data: { user: { id: '1', email: 'test@example.com' } } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.login('test@example.com', 'password')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      )
      expect(result).toEqual({ data: mockResponse })
    })

    it('should handle login error', async () => {
      const errorResponse = { error: 'Invalid credentials' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response)

      const result = await api.login('test@example.com', 'wrong-password')

      expect(result).toEqual({ error: 'Invalid credentials' })
    })

    it('should register user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890'
      }
      const mockResponse = { data: { user: { id: '1', ...userData } } }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.register(userData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      )
      expect(result).toEqual({ data: mockResponse })
    })

    it('should logout successfully', async () => {
      const mockResponse = { message: 'Logged out successfully' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/logout',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result).toEqual({ data: mockResponse })
    })
  })

  describe('Properties', () => {
    it('should fetch properties with params', async () => {
      const mockProperties = {
        properties: [
          { id: '1', title: 'Test Property', price: 100000 }
        ],
        total: 1,
        page: 1
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperties,
      } as Response)

      const params = {
        page: 1,
        limit: 10,
        type: 'house',
        minPrice: 50000,
        maxPrice: 200000
      }

      const result = await api.getProperties(params)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/properties?page=1&limit=10&type=house&minPrice=50000&maxPrice=200000',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
      )
      expect(result).toEqual({ data: mockProperties })
    })

    it('should fetch single property', async () => {
      const mockProperty = { id: '1', title: 'Test Property', price: 100000 }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperty,
      } as Response)

      const result = await api.getProperty('1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/properties/1',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual({ data: mockProperty })
    })

    it('should create property', async () => {
      const propertyData = {
        title: 'New Property',
        description: 'A beautiful home',
        price: 150000,
        location: 'Test City',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        area: 1200
      }
      
      const mockResponse = { data: { id: '1', ...propertyData } }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.createProperty(propertyData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/properties',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(propertyData),
        })
      )
      expect(result).toEqual({ data: mockResponse })
    })

    it('should update property', async () => {
      const updateData = { title: 'Updated Property', price: 160000 }
      const mockResponse = { data: { id: '1', ...updateData } }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.updateProperty('1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/properties/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result).toEqual({ data: mockResponse })
    })

    it('should delete property', async () => {
      const mockResponse = { message: 'Property deleted successfully' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.deleteProperty('1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/properties/1',
        expect.objectContaining({ method: 'DELETE' })
      )
      expect(result).toEqual({ data: mockResponse })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await api.login('test@example.com', 'password')

      expect(result).toEqual({
        error: 'Network connection failed. Please check your internet connection.'
      })
    })

    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') },
      } as Response)

      const result = await api.getProperties()

      expect(result).toEqual({ error: 'Invalid response from server' })
    })

    it('should handle server errors', async () => {
      const errorResponse = { error: 'Internal server error' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      } as Response)

      const result = await api.getProperties()

      expect(result).toEqual({ error: 'Internal server error' })
    })
  })

  describe('File Upload', () => {
    it('should upload files successfully', async () => {
      const mockFiles = {
        0: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
        1: new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        length: 2,
        item: (index: number) => null,
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this[i]
          }
        }
      } as FileList

      const mockResponse = { data: { urls: ['url1', 'url2'] } }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await api.uploadFiles(mockFiles)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/upload',
        expect.objectContaining({
          method: 'POST',
          headers: {},
        })
      )
      expect(result).toEqual({ data: mockResponse })
    })
  })
})