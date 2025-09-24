const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Always merge headers correctly
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // ================== Auth APIs ==================
  async register(userData: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOtp(data: { email?: string; phone?: string; otp: string }) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: { email?: string; phone?: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async resendOtp(data: { email?: string; phone?: string }) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: { email: string }) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyResetOtp(data: { email: string; otp: string }) {
    return this.request('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================== Notes APIs ==================
  async createNote(token: string, noteData: { title: string; description: string }) {
    return this.request('/notes', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(noteData),
    });
  }

  async getNotes(token: string) {
    return this.request('/notes', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  async updateNote(token: string, noteId: string, noteData: { title: string; description: string }) {
    return this.request(`/notes/${noteId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(token: string, noteId: string) {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // ================== Admin APIs ==================
  async adminLogin(credentials: { email: string; password: string }) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getAllUsers(token: string) {
    return this.request('/admin/users', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  async deleteUser(token: string, userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async getAllNotes(token: string) {
    return this.request('/admin/notes', {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });
  }

  async deleteAnyNote(token: string, noteId: string) {
    return this.request(`/admin/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }
}

export const apiService = new ApiService();
