import axiosInstance from './axios';

// 타입 정의
export interface Category {
  _id: string;
  name: string;
  slug: string;
  level: number;
  imageUrl: string;
  order: number;
  isActive: boolean;
  productCount: number;
  content?: string;
}

export interface CategoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: Category[];
}

export interface ProductCategory {
  mainCategory: string;
  subCategory: string;
  series: string;
}

export interface ProductDownload {
  type: string;
  category: string;
  url: string;
  model: string;
}

export interface ProductAdditionalInfo {
  [key: string]: string;
}

export interface ProductCreateRequest {
  productName: string;
  productNameKo: string;
  category: ProductCategory;
  sourceUrl?: string;
  imageUrls?: string[];
  mainImageUrl?: string;
  specificationHtml?: string;
  downloads?: ProductDownload[];
  additionalInfo?: ProductAdditionalInfo;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  priority?: number;
  pdfUrl?: string;
  youtubeUrl?: string;
}

export interface ProductUpdateRequest {
  productName?: string;
  productNameKo?: string;
  category?: ProductCategory;
  sourceUrl?: string;
  imageUrls?: string[];
  mainImageUrl?: string;
  specificationHtml?: string;
  downloads?: ProductDownload[];
  additionalInfo?: ProductAdditionalInfo;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  priority?: number;
  pdfUrl?: string;
  youtubeUrl?: string;
}

export interface CategoryUpdateRequest {
  slug?: string;
  productName?: string;
  productNameKo?: string;
  category?: ProductCategory;
  sourceUrl?: string;
  imageUrls?: string[];
  mainImageUrl?: string;
  specificationHtml?: string;
  downloads?: ProductDownload[];
  additionalInfo?: ProductAdditionalInfo;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  priority?: number;
  pdfUrl?: string;
  youtubeUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

// Products API
export const productsAPI = {
  // 대분류 카테고리 조회
  getLevel1Categories: async (): Promise<CategoryResponse> => {
    const response = await axiosInstance.get<CategoryResponse>(
      '/api/categories/level1'
    );
    return response.data;
  },

  // 제품 생성
  createProduct: async (
    productData: ProductCreateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(
      '/api/product-admin',
      productData
    );
    return response.data;
  },

  // 제품 수정
  updateProduct: async (
    slug: string,
    productData: ProductUpdateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/product-admin/${slug}`,
      productData
    );
    return response.data;
  },

  // 카테고리 수정
  updateCategory: async (
    slug: string,
    categoryData: CategoryUpdateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/category-admin/${slug}`,
      categoryData
    );
    return response.data;
  },
};
