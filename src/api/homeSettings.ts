import axiosInstance from "./axios";
import { revalidateHomePage } from "@/utils/revalidation";
import { v4 as uuidv4 } from "uuid";

// 타입 정의
export interface MainImage {
  url: string;
  order: number;
  alt: string | null;
  altKo: string | null;
}

export interface Introduction {
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
}

export interface HomeSettings {
  _id: string;
  mainImages: MainImage[];
  introduction: Introduction;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UploadFileResponse {
  url: string;
  path: string;
  folder: string;
  fileName: string;
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
  // 홈 설정 전체 조회 (메인 이미지 포함)
  getHomeSettings: async (): Promise<ApiResponse<HomeSettings>> => {
    const response = await axiosInstance.get<ApiResponse<HomeSettings>>(
      "/api/home-settings-admin"
    );
    return response.data;
  },

  // 메인 이미지 목록만 조회
  getMainImages: async (): Promise<ApiResponse<MainImage[]>> => {
    const response = await homeSettingsAPI.getHomeSettings();
    if (response.success && response.data) {
      return {
        success: response.success,
        code: response.code,
        message: response.message,
        data: response.data.mainImages,
      };
    }
    return {
      success: response.success,
      code: response.code,
      message: response.message,
      data: undefined,
    };
  },

  // 파일을 GCP Cloud Storage에 업로드 (대표 이미지는 항상 banner 폴더 사용)
  uploadFile: async (
    file: File,
    folder:
      | "banner"
      | "product"
      | "resource"
      | "company"
      | "category" = "banner"
  ): Promise<ApiResponse<UploadFileResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    // folder는 query parameter로 전달
    const response = await axiosInstance.post<ApiResponse<UploadFileResponse>>(
      `/api/upload-admin?folder=${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // 메인 이미지 추가 (2단계: 파일 업로드 후 이미지 정보 저장)
  uploadMainImage: async (
    file: File,
    alt: string,
    altKo: string
  ): Promise<ApiResponse<MainImage>> => {
    try {
      // 파일명을 UUID + 날짜 + 확장자로 변경
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const timestamp = Date.now();
      const uuid = uuidv4();
      const newFileName = `${timestamp}-${uuid}${fileExtension}`;

      // 새로운 파일명으로 File 객체 생성
      const renamedFile = new File([file], newFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      // 1단계: 파일을 GCP에 업로드 (banner 폴더 사용)
      const uploadResponse = await homeSettingsAPI.uploadFile(renamedFile, "banner");

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(
          uploadResponse.message || "파일 업로드에 실패했습니다."
        );
      }

      // 2단계: 업로드된 이미지 URL을 사용하여 메인 이미지 정보 저장
      const imageData: MainImageUploadRequest = {
        url: uploadResponse.data.url,
        alt,
        altKo,
      };

      const response = await axiosInstance.post<ApiResponse<MainImage>>(
        "/api/home-settings-admin/main-images",
        imageData
      );

      // 이미지 업로드 성공 시 Kitagawa 사이트 홈 페이지 재생성
      if (response.data.success) {
        await revalidateHomePage();
      }

      return response.data;
    } catch (error: any) {
      console.error("Main image upload error:", error);
      return {
        success: false,
        code: error.response?.status || 500,
        message:
          error.response?.data?.message ||
          error.message ||
          "이미지 업로드 중 오류가 발생했습니다.",
      };
    }
  },

  // 메인 이미지 순서 변경 (PATCH 메서드 사용)
  updateImageOrder: async (
    orderData: ImageOrderUpdateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      "/api/home-settings-admin/main-images/order",
      orderData
    );

    // 순서 변경 성공 시 Kitagawa 사이트 홈 페이지 재생성
    if (response.data.success) {
      await revalidateHomePage();
    }

    return response.data;
  },

  // GCP에서 파일 삭제
  deleteFile: async (fileUrl: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(
      "/api/upload-admin",
      {
        data: {
          url: fileUrl,
        },
      }
    );

    return response.data;
  },

  // 메인 이미지 삭제 (홈 설정에서만 삭제, 파일은 유지)
  deleteMainImage: async (imageUrl: string): Promise<ApiResponse> => {
    try {
      // URL을 경로 파라미터로 전달하기 위해 인코딩

      const response = await axiosInstance.delete<ApiResponse>(
        `/api/home-settings-admin/main-images/${encodeURIComponent(imageUrl)}`
      );

      // 이미지 삭제 성공 시 Kitagawa 사이트 홈 페이지 재생성
      if (response.data.success) {
        await revalidateHomePage();
      }

      return response.data;
    } catch (error: any) {
      console.error("Delete main image error:", error);
      return {
        success: false,
        code: error.response?.status || 500,
        message:
          error.response?.data?.message ||
          error.message ||
          "이미지 삭제 중 오류가 발생했습니다.",
      };
    }
  },

  // 메인 이미지 삭제 + GCP 파일 삭제
  deleteMainImageWithFile: async (imageUrl: string): Promise<ApiResponse> => {
    try {
      // 1. 홈 설정에서 이미지 제거
      const deleteImageResponse = await homeSettingsAPI.deleteMainImage(
        imageUrl
      );

      if (!deleteImageResponse.success) {
        return deleteImageResponse;
      }

      // 2. GCP에서 실제 파일 삭제
      await homeSettingsAPI.deleteFile(imageUrl);

      return deleteImageResponse;
    } catch (error: any) {
      console.error("Delete main image with file error:", error);
      return {
        success: false,
        code: error.response?.status || 500,
        message:
          error.response?.data?.message ||
          error.message ||
          "이미지 삭제 중 오류가 발생했습니다.",
      };
    }
  },
};
