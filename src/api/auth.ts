import axiosInstance from './axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Admin {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    admin: Admin;
  };
}

export const authAPI = {
  // 로그인 API
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/api/auth-admin/login',
      credentials
    );
    return response.data;
  },

  // 로그아웃
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('admin');
    }
  },

  // 토큰 저장 (만료 시간 포함)
  saveToken: (token: string, admin: Admin, expiresInMinutes: number = 60) => {
    if (typeof window !== 'undefined') {
      const expiryTime = new Date().getTime() + expiresInMinutes * 60 * 1000;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      localStorage.setItem('admin', JSON.stringify(admin));
    }
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  // 관리자 정보 가져오기
  getAdmin: (): Admin | null => {
    if (typeof window !== 'undefined') {
      const adminStr = localStorage.getItem('admin');
      return adminStr ? JSON.parse(adminStr) : null;
    }
    return null;
  },

  // 토큰 만료 시간 가져오기
  getTokenExpiry: (): number | null => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('tokenExpiry');
      return expiry ? parseInt(expiry, 10) : null;
    }
    return null;
  },

  // 토큰 만료 확인
  isTokenExpired: (): boolean => {
    const expiry = authAPI.getTokenExpiry();
    if (!expiry) return true;
    return new Date().getTime() > expiry;
  },

  // 인증 확인
  isAuthenticated: (): boolean => {
    return !!authAPI.getToken() && !authAPI.isTokenExpired();
  },

  // 비밀번호 변경
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; code: number; message: string }> => {
    const response = await axiosInstance.patch(
      '/api/auth-admin/change-password',
      { currentPassword, newPassword }
    );
    return response.data;
  },

  // 아이디 변경
  changeUsername: async (
    newUsername: string
  ): Promise<{ success: boolean; code: number; message: string }> => {
    const response = await axiosInstance.patch(
      '/api/auth-admin/change-username',
      { newUsername }
    );
    return response.data;
  },

  // 관리자 등록
  register: async (
    username: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; code: number; message: string; data?: any }> => {
    const response = await axiosInstance.post('/api/auth-admin/register', {
      username,
      password,
      name,
    });
    return response.data;
  },

  // 모든 관리자 조회
  getAllAdmins: async (): Promise<{
    success: boolean;
    code: number;
    message: string;
    data: Admin[];
  }> => {
    const response = await axiosInstance.get('/api/auth-admin/all');
    return response.data;
  },

  // 관리자 삭제
  deleteAdmin: async (
    adminId: string
  ): Promise<{ success: boolean; code: number; message: string }> => {
    const response = await axiosInstance.delete(`/api/auth-admin/${adminId}`);
    return response.data;
  },
};
