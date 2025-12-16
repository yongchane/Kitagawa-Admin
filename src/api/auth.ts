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
      localStorage.removeItem('admin');
    }
  },

  // 토큰 저장
  saveToken: (token: string, admin: Admin) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
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

  // 인증 확인
  isAuthenticated: (): boolean => {
    return !!authAPI.getToken();
  },
};
