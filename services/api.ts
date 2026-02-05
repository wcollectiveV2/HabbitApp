/**
 * API Base Client for HabitPulse
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Auth API uses the same backend with /api prefix
const AUTH_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildUrl(endpoint: string): string {
    // Normalization logic to prevent double slash or double /api
    let base = this.baseUrl;
    let path = endpoint;
    
    // Remove trailing slash from base
    if (base.endsWith('/')) base = base.slice(0, -1);
    
    // Remove leading slash from path
    if (path.startsWith('/')) path = path.slice(1);
    
    // Fix for double /api prefix issue
    // If base ends with /api AND path starts with api/
    if (base.endsWith('/api') && path.startsWith('api/')) {
       path = path.slice(4); // Remove 'api/' from start of path
    }
    
    return `${base}/${path}`;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        // If parsing fails but it wasn't JSON content-type anyway, 
        // it might be HTML/Text. Returning as is might be unsafe if T is expected to be object, 
        // but it helps debugging.
        console.warn('Response was not JSON:', text.substring(0, 100));
        return text as unknown as T;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  }
}

// Main API client - endpoints should include /api prefix (e.g., /api/habits)
export const api = new ApiClient(API_BASE_URL);
// Auth API client - uses same base URL, endpoints should include /api prefix
export const authApi = new ApiClient(AUTH_API_URL);
