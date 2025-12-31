import axiosInstance from "./axios";

// API 응답 타입 정의
export interface InfoUpdateResponse {
  success: boolean;
  message: string;
}

// 타입 정의
export interface ProductRequestData {
  companyName: string;
  ceo: string;
  address?: string;
  phone: string;
  mobile?: string;
  fax?: string;
  email?: string;
  website?: string;
  locations?: CompanyLocation[];
}

export interface CompanyLocation {
  name: string;
  type: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  coordinates: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// api 호출 함수 선언 -> 그안에 response를 선언후 api 연동
export const infoAPI = {
  submitInfoPatch: async (data: ProductRequestData): Promise<InfoUpdateResponse> => {
    const response = await axiosInstance.patch<InfoUpdateResponse>(
      "/api/contact-admin/info/contact",
      {
        companyName: data.companyName || "",
        ceo: data.ceo || "",
        address: data.address || "",
        phone: data.phone || "",
        mobile: data.mobile || "",
        fax: data.fax || "",
        email: data.email || "",
        website: data.website || "",
        locations: data.locations || [],
      }
    );
    return response.data;
  },
};
