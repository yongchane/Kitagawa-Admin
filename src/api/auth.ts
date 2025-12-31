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
};
