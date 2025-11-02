import axiosInstance from './axios';

// 타입 정의
export interface MainImage {
  id?: string;
  url: string;
  alt: string;
  altKo: string;
  order?: number;
}

export interface MainImageUploadRequest {
  url: string;
  alt: string;
  altKo: string;
}

export interface ImageOrderUpdateRequest {
  imageUrls: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

// Home Settings API
export const homeSettingsAPI = {
  // 메인 이미지 목록 조회
  getMainImages: async (): Promise<ApiResponse<MainImage[]>> => {
    const response = await axiosInstance.get<ApiResponse<MainImage[]>>(
      '/api/home-settings-admin/main-images'
    );
    return response.data;
  },

  // 메인 이미지 업로드 (파일 직접 업로드)
  uploadMainImage: async (
    file: File,
    alt: string,
    altKo: string
  ): Promise<ApiResponse<MainImage>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', alt);
    formData.append('altKo', altKo);

    const response = await axiosInstance.post<ApiResponse<MainImage>>(
      '/api/home-settings-admin/main-images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 메인 이미지 순서 변경
  updateImageOrder: async (
    orderData: ImageOrderUpdateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.put<ApiResponse>(
      '/api/home-settings-admin/main-images/order',
      orderData
    );
    return response.data;
  },

  // 메인 이미지 삭제
  deleteMainImage: async (imageUrl: string): Promise<ApiResponse> => {
    // URL 인코딩
    const encodedUrl = encodeURIComponent(imageUrl);
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/home-settings-admin/main-images/${encodedUrl}`
    );
    return response.data;
  },
};
