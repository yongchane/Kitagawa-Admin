import axiosInstance from "./axios";

// 타입 정의
export interface ProductRequestData {
  productName?: string;
  seriesName?: string;
  url?: string;
  requestDetails?: string;
  autoImport?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

// Request API
export const requestAPI = {
  // 제품 요청 제출
  submitProductRequest: async (
    data: ProductRequestData
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(
      "/api/contact-admin/requests",
      {
        productName: data.productName || "",
        seriesName: data.seriesName || "",
        url: data.url || "",
        requestDetails: data.requestDetails || "",
        autoImport: data.autoImport ?? false,
      }
    );
    return response.data;
  },
};
