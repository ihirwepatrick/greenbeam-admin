const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://greenbeam-backend.onrender.com/api/v1';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async ensureAuthHeader(headers: HeadersInit = {}): Promise<HeadersInit> {
    const token = this.getToken();
    if (!token) {
      return headers;
    }
    return {
      ...(headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;
      const { authService } = await import('./services/api');
      const res = await authService.refresh(refreshToken);
      if (res.success) {
        this.setToken(res.data.token);
        localStorage.setItem('refresh_token', res.data.refreshToken);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headersWithAuth = await this.ensureAuthHeader(options.headers as HeadersInit);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...headersWithAuth,
      },
      ...options,
    };

    try {
      let response = await fetch(url, config);
      if (response.status === 401) {
        // Attempt refresh
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          const retryHeaders = await this.ensureAuthHeader(options.headers as HeadersInit);
          response = await fetch(url, {
            ...config,
            headers: {
              'Content-Type': 'application/json',
              ...retryHeaders,
            },
          });
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          throw new Error('Authentication failed');
        }
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload request
  async upload<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          // Provide more detailed error information
          let errorMessage = `HTTP ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            if (errorData.error && errorData.error.message) {
              errorMessage += `: ${errorData.error.message}`;
            } else if (errorData.message) {
              errorMessage += `: ${errorData.message}`;
            }
          } catch {
            // If response is not JSON, include response text if available
            if (xhr.responseText) {
              errorMessage += `: ${xhr.responseText}`;
            }
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 