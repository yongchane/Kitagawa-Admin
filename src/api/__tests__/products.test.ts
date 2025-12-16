/**
 * Products API 테스트
 * 실제 DB를 건드리지 않고 Mock을 사용하여 테스트
 */

import { productsAPI } from '../products';
import axiosInstance from '../axios';

// axios를 Mock으로 대체
jest.mock('../axios');
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('Products API - Mock 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 Mock 초기화
    jest.clearAllMocks();
  });

  describe('getLevel1Categories', () => {
    it('Level 1 카테고리 목록을 정상적으로 가져와야 함', async () => {
      // Given: Mock 응답 설정
      const mockResponse = {
        data: {
          success: true,
          code: 200,
          message: '카테고리 조회 성공',
          data: {
            items: [
              {
                _id: '1',
                name: 'CHUCK',
                slug: 'chuck',
                level: 1,
                imageUrl: 'https://test.jpg',
                order: 0,
                isActive: true,
                productCount: 40,
                content: 'Wide variety',
              },
              {
                _id: '2',
                name: 'NC ROTARY TABLE',
                slug: 'nc-rotary-table',
                level: 1,
                imageUrl: 'https://test2.jpg',
                order: 1,
                isActive: true,
                productCount: 25,
                content: 'High accuracy',
              },
            ],
            total: 2,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // When: API 호출
      const result = await productsAPI.getLevel1Categories();

      // Then: 검증
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/product-admin/level1');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
      expect(result.data?.items[0].slug).toBe('chuck');

      // ✅ 실제 DB 조회 없음!
    });
  });

  describe('updateLevel1Category', () => {
    it('Level 1 카테고리를 올바른 데이터로 수정해야 함', async () => {
      // Given
      const slug = 'chuck';
      const updateData = {
        name: 'CHUCK UPDATED',
        content: 'New description',
        imageUrl: 'https://new-image.jpg',
        isActive: true,
      };

      const mockResponse = {
        data: {
          success: true,
          code: 200,
          message: '수정 완료',
          data: {
            slug,
            ...updateData,
          },
        },
      };

      mockedAxios.patch.mockResolvedValue(mockResponse);

      // When
      const result = await productsAPI.updateLevel1Category(slug, updateData);

      // Then
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `/api/product-admin/level1/${slug}`,
        updateData
      );
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('CHUCK UPDATED');

      // ✅ 실제 DB 변경 없음!
    });

    it('잘못된 데이터로 수정 시 에러 반환', async () => {
      // Given
      const slug = 'chuck';
      const invalidData = {
        name: '', // 빈 이름
        content: '',
        imageUrl: '',
        isActive: true,
      };

      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            code: 400,
            message: 'Invalid data',
          },
        },
      };

      mockedAxios.patch.mockRejectedValue(mockError);

      // When & Then
      try {
        await productsAPI.updateLevel1Category(slug, invalidData);
        fail('Should throw error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toBe('Invalid data');
      }

      // ✅ DB 안전!
    });
  });

  describe('reorderLevel1Categories', () => {
    it('Level 1 카테고리 순서를 일괄 변경해야 함', async () => {
      // Given
      const items = [
        { slug: 'nc-rotary-table', order: 0 },
        { slug: 'chuck', order: 1 },
        { slug: 'power-chuck', order: 2 },
      ];

      const mockResponse = {
        data: {
          success: true,
          code: 200,
          message: '순서 변경 완료',
        },
      };

      mockedAxios.patch.mockResolvedValue(mockResponse);

      // When
      const result = await productsAPI.reorderLevel1Categories(items);

      // Then
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/api/product-admin/level1/reorder',
        { items }
      );
      expect(result.success).toBe(true);

      // ✅ DB 안전!
    });
  });

  describe('getLevel2Categories', () => {
    it('특정 카테고리의 Level 2 서브카테고리 조회', async () => {
      // Given
      const categorySlug = 'chuck';
      const mockResponse = {
        data: {
          success: true,
          code: 200,
          message: '조회 성공',
          data: {
            category: {
              _id: '1',
              name: 'CHUCK',
              slug: 'chuck',
              level: 1,
              order: 0,
              isActive: true,
              productCount: 40,
              imageUrl: 'https://test.jpg',
              content: 'Wide variety',
            },
            subCategories: [
              {
                _id: '10',
                name: '유압 중공척',
                slug: 'chuck-hydraulic-hollow-chuck',
                order: 0,
                isActive: true,
                productCount: 11,
                imageUrl: 'https://test1.jpg',
                content: null,
              },
              {
                _id: '11',
                name: '유압 중실척',
                slug: 'chuck-hydraulic-solid-chuck',
                order: 1,
                isActive: true,
                productCount: 9,
                imageUrl: 'https://test2.jpg',
                content: null,
              },
            ],
            totalSubCategories: 2,
            totalProducts: 20,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // When
      const result = await productsAPI.getLevel2Categories(categorySlug);

      // Then
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/product-admin/level2/${categorySlug}`
      );
      expect(result.success).toBe(true);
      expect(result.data?.subCategories).toHaveLength(2);

      // ✅ DB 조회 없음!
    });
  });

  describe('reorderLevel2Categories', () => {
    it('Level 2 카테고리 순서를 일괄 변경해야 함', async () => {
      // Given
      const categorySlug = 'chuck';
      const items = [
        { slug: 'chuck-hydraulic-solid-chuck', order: 0 },
        { slug: 'chuck-hydraulic-hollow-chuck', order: 1 },
        { slug: 'chuck-scroll-chuck', order: 2 },
      ];

      const mockResponse = {
        data: {
          success: true,
          code: 200,
          message: '순서 변경 완료',
        },
      };

      mockedAxios.patch.mockResolvedValue(mockResponse);

      // When
      const result = await productsAPI.reorderLevel2Categories(categorySlug, items);

      // Then
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `/api/product-admin/level2/${categorySlug}/reorder`,
        { items }
      );
      expect(result.success).toBe(true);

      // ✅ DB 안전!
    });

    it('순서 변경 실패 시 에러 처리', async () => {
      // Given
      const categorySlug = 'invalid-slug';
      const items = [{ slug: 'test', order: 0 }];

      const mockError = {
        response: {
          status: 404,
          data: {
            success: false,
            code: 404,
            message: 'Category not found',
          },
        },
      };

      mockedAxios.patch.mockRejectedValue(mockError);

      // When & Then
      try {
        await productsAPI.reorderLevel2Categories(categorySlug, items);
        fail('Should throw error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }

      // ✅ DB 안전!
    });
  });
});
