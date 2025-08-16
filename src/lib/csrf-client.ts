// Client-side CSRF token management
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getCSRFToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch('/api/csrf');
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    
    if (!data.csrfToken) {
      throw new Error('No CSRF token received from server');
    }
    
    cachedToken = data.csrfToken;
    tokenExpiry = data.expires;
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

// Helper function to make authenticated API requests with CSRF protection
export async function makeAuthenticatedRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCSRFToken();
  
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', token);
  headers.set('Content-Type', 'application/json');
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });
}

// Clear cached token (useful for logout)
export function clearCSRFToken(): void {
  cachedToken = null;
  tokenExpiry = 0;
}