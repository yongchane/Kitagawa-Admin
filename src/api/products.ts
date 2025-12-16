import axiosInstance from "./axios";
import {
  revalidateProductPage,
  revalidateCategoryPage,
  extractCategorySlug,
} from "@/utils/revalidation";

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

// Level 2 카테고리의 children 타입
export interface CategoryChild {
  name: string;
  slug: string;
  productCount: number;
  imageUrl: string;
}

// Level 2 카테고리 계층 구조 타입
export interface Level2Category {
  _id: string;
  name: string;
  nameKo: string;
  level: number;
  order: number;
  isActive: boolean;
  productCount: number;
  parentLevelCategory: string;
  parentLevelSlug: string;
  children: CategoryChild[];
}

export interface Level2CategoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: Level2Category[];
}

export interface CategoryResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: Category[];
    total: number;
  };
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
  slug: string;
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

export interface Level1ReorderItem {
  slug: string;
  order: number;
}

export interface Level1ReorderRequest {
  items: Level1ReorderItem[];
}

export interface Level2ReorderItem {
  slug: string;
  order: number;
}

export interface Level2ReorderRequest {
  items: Level2ReorderItem[];
}

export interface Level2SubCategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  productCount: number;
  imageUrl: string | null;
  content: string | null;
}

export interface Level2GetResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    category: Category;
    subCategories: Level2SubCategory[];
    totalSubCategories: number;
    totalProducts: number;
  };
}

export interface Level1UpdateRequest {
  name?: string;
  content?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Level3Product {
  _id: string;
  slug: string;
  productName: string;
  productTitle: string;
  category: {
    mainCategory: string;
    subCategory: string;
    series: string;
  };
  mainImageUrl: string;
  description: string;
  orderInLevel2: number;
  isActive: boolean;
  viewCount: number;
}

export interface Level3SubCategory {
  _id: string;
  name: string;
  slug: string;
  parentName: string;
  level: number;
  order: number;
  isActive: boolean;
  productCount: number;
}

export interface Level3GetResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    subCategory: Level3SubCategory;
    items: Level3Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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
      "/api/product-admin/level1"
    );
    return response.data;
  },

  // Level 2 카테고리 계층 구조 조회 (slug로 조회)
  getLevel2CategoriesBySlug: async (
    slug: string
  ): Promise<Level2CategoryResponse> => {
    const response = await axiosInstance.get<Level2CategoryResponse>(
      `/api/categories/${slug}/hierarchy`
    );
    return response.data;
  },

  // 제품 생성
  createProduct: async (
    productData: ProductCreateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.post<ApiResponse>(
      "/api/product-admin",
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
      console.log(
        "[Product Delete] 제품 삭제 완료. 카테고리 페이지는 자동 갱신됩니다."
      );
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

  // Level 1 카테고리 일괄 순서 변경
  reorderLevel1Categories: async (
    items: Level1ReorderItem[]
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      "/api/product-admin/level1/reorder",
      { items }
    );
    return response.data;
  },

  // Level 1 카테고리 정보 수정
  updateLevel1Category: async (
    slug: string,
    data: Level1UpdateRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/product-admin/level1/${slug}`,
      data
    );
    return response.data;
  },

  // Level 2 카테고리 조회 (categorySlug로)
  getLevel2Categories: async (
    categorySlug: string
  ): Promise<Level2GetResponse> => {
    const response = await axiosInstance.get<Level2GetResponse>(
      `/api/product-admin/level2/${categorySlug}`
    );
    return response.data;
  },

  // Level 2 카테고리 일괄 순서 변경
  reorderLevel2Categories: async (
    categorySlug: string,
    items: Level2ReorderItem[]
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(
      `/api/product-admin/level2/${categorySlug}/reorder`,
      { items }
    );
    return response.data;
  },

  // Level 3 제품 목록 조회 (subCategorySlug로)
  getLevel3Products: async (
    subCategorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<Level3GetResponse> => {
    const response = await axiosInstance.get<Level3GetResponse>(
      `/api/product-admin/level3/${subCategorySlug}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },
};
