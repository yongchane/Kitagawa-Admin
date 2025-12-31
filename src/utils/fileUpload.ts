import { v4 as uuidv4 } from "uuid";
import axiosInstance from "@/api/axios";

export interface UploadFileResponse {
  url: string;
  path: string;
  folder: string;
  fileName: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

/**
 * 파일명을 UUID + 날짜 형식으로 변경
 */
export function generateUniqueFileName(originalFileName: string): string {
  const fileExtension = originalFileName.substring(
    originalFileName.lastIndexOf(".")
  );
  const timestamp = Date.now();
  const uuid = uuidv4();
  return `${timestamp}-${uuid}${fileExtension}`;
}

/**
 * File 객체의 이름을 변경하여 새로운 File 객체 생성
 */
export function renameFile(file: File, newFileName: string): File {
  return new File([file], newFileName, {
    type: file.type,
    lastModified: file.lastModified,
  });
}

/**
 * 파일을 GCP Cloud Storage에 업로드
 * @param file 업로드할 파일
 * @param folder 저장할 폴더 (banner, product, resource, company, category)
 */
export async function uploadFileToGCP(
  file: File,
  folder: "banner" | "product" | "resource" | "company" | "category"
): Promise<ApiResponse<UploadFileResponse>> {
  try {
    // 파일명을 UUID + 날짜로 변경
    const newFileName = generateUniqueFileName(file.name);
    const renamedFile = renameFile(file, newFileName);

    // FormData 생성
    const formData = new FormData();
    formData.append("file", renamedFile);

    // API 호출
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
  } catch (error) {
    console.error("File upload error:", error);

    // Axios 에러인지 확인
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      return {
        success: false,
        code: axiosError.response?.status || 500,
        message:
          axiosError.response?.data?.message ||
          axiosError.message ||
          "파일 업로드 중 오류가 발생했습니다.",
      };
    }

    // 일반 에러
    return {
      success: false,
      code: 500,
      message: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
    };
  }
}
