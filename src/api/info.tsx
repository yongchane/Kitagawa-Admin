import axiosInstance from "./axios";

// API 응답 타입 정의
export interface InfoUpdateResponse {
  success: boolean;
  message: string;
}

// 기본 회사 정보 데이터
export const DEFAULT_COMPANY_DATA = {
  companyName: "(주)한국 기타가와",
  ceo: "최민형",
  address: "서울 금천구 가산디지털1로 168 우림라이온스벨리 B동 803호",
  phone: "02-2026-2222",
  mobile: "010-3616-9973",
  fax: "02-2026-2223",
  email: "kiw@kitagawa.co.kr",
  website: "https://www.kitagawa.co.kr",
  locations: [
    {
      name: "본사",
      type: "headquarters",
      address: "서울 금천구 가산디지털1로 168 우림라이온스벨리 B동 803호",
      phone: "02-2026-2222",
      fax: "02-2026-2223",
      email: "",
      website: "",
      coordinates: {
        lat: 37.4812845,
        lng: 126.8821449
      }
    },
    {
      name: "안산 서비스 센터",
      type: "service_center",
      address: "경기도 안산시 단원구 산단로 31",
      phone: "031-XXX-XXXX",
      fax: "",
      email: "",
      website: "",
      coordinates: {
        lat: 37.3208,
        lng: 126.8306
      }
    }
  ]
};

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
    // 기본값과 입력값 병합 (입력값이 우선, 없으면 기본값 사용)
    const payload = {
      companyName: data.companyName || DEFAULT_COMPANY_DATA.companyName,
      ceo: data.ceo || DEFAULT_COMPANY_DATA.ceo,
      address: data.address || DEFAULT_COMPANY_DATA.address,
      phone: data.phone || DEFAULT_COMPANY_DATA.phone,
      mobile: data.mobile || DEFAULT_COMPANY_DATA.mobile,
      fax: data.fax || DEFAULT_COMPANY_DATA.fax,
      email: data.email || DEFAULT_COMPANY_DATA.email,
      website: data.website || DEFAULT_COMPANY_DATA.website,
      locations: data.locations && data.locations.length > 0
        ? data.locations
        : DEFAULT_COMPANY_DATA.locations,
    };

    console.log('[INFO API] Sending PATCH request');
    console.log('[INFO API] Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await axiosInstance.patch<InfoUpdateResponse>(
        "/api/contact-admin/info/contact",
        payload
      );
      console.log('[INFO API] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[INFO API] Error:', error);
      console.error('[INFO API] Error response:', error.response?.data);
      console.error('[INFO API] Error status:', error.response?.status);
      throw error;
    }
  },
};
