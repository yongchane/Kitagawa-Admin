import axiosInstance from './axios';
import {
  revalidateProductPage,
  revalidateCategoryPage,
  extractCategorySlug,
} from '@/utils/revalidation';

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

export interface ProductOrderUpdateRequest {
  order: number;
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

    // 제품 생성 성공 시 Kitagawa 사이트 카테고리 페이지 재생성
    if (response.data.success && response.data.data) {
      const categorySlug = extractCategorySlug(response.data.data.category);
      await revalidateCategoryPage(categorySlug);
    }

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

    // 제품 수정 성공 시 Kitagawa 사이트 페이지 재생성
    if (response.data.success && response.data.data) {
      const categorySlug = extractCategorySlug(response.data.data.category);
      await revalidateProductPage(categorySlug, slug);
    }

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

  // 제품 순서 변경
  updateProductOrder: async (
    slug: string,
    order: number
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/product-admin/${slug}/order`,
      { order }
    );
    return response.data;
  },

  // 카테고리 순서 변경
  updateCategoryOrder: async (
    slug: string,
    order: number
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/category-admin/${slug}/order`,
      { order }
    );
    return response.data;
  },

  // 제품 삭제
  deleteProduct: async (slug: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/product-admin/${slug}`
    );

    // 제품 삭제 성공 시 Kitagawa 사이트 카테고리 페이지 재생성
    if (response.data.success) {
      // 삭제된 제품의 카테고리 정보를 알 수 없으므로 전체 재생성은 하지 않음
      console.log('[Product Delete] 제품 삭제 완료. 카테고리 페이지는 자동 갱신됩니다.');
    }

    return response.data;
  },

  // 카테고리 삭제
  deleteCategory: async (slug: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(
      `/api/category-admin/${slug}`
    );

    // 카테고리 삭제 성공 시 Kitagawa 사이트 홈 페이지 재생성
    if (response.data.success) {
      await revalidateCategoryPage(slug);
    }

    return response.data;
  },
};
