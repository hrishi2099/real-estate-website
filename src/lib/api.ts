const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' ? window.location.origin : ''
);

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies
      ...options,
    };

    try {
      if (typeof console !== 'undefined' && console.log) {
        console.log('Making API request to:', url);
      }
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('Failed to parse JSON response:', jsonError);
        }
        return { error: 'Invalid response from server' };
      }

      if (!response.ok) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('API error response:', response.status, data);
        }
        return { error: data.error || `Server error: ${response.status}` };
      }

      return { data };
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('API request failed:', error);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { error: 'Network connection failed. Please check your internet connection.' };
      }
      
      return { error: 'Network error occurred' };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Property endpoints
  async getProperties(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/properties${query ? `?${query}` : ''}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData: {
    title: string;
    description?: string;
    price: number;
    location: string;
    address?: string;
    type: string;
    isFeatured?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    yearBuilt?: number;
    features?: string[];
  }) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: string, propertyData: {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    address?: string;
    type?: string;
    isFeatured?: boolean;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    yearBuilt?: number;
    features?: string[];
  }) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, { method: 'DELETE' });
  }

  // Admin endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  async updateUser(id: string, userData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
  }) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async getAnalytics(timeframe?: string) {
    const query = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/admin/analytics${query}`);
  }

  async getInquiries(params?: {
    page?: number;
    limit?: number;
    status?: string;
    propertyId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/admin/inquiries${query ? `?${query}` : ''}`);
  }

  async updateInquiry(id: string, status: string) {
    return this.request(`/admin/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Aliases for admin user management (for consistency with component naming)
  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    return this.getUsers(params);
  }

  async deleteAdminUser(id: string) {
    return this.deleteUser(id);
  }

  // File upload
  async uploadFiles(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }
}

export const api = new ApiClient();