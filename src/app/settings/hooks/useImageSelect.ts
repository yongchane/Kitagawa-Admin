import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { homeSettingsAPI, MainImage } from "@/api/homeSettings";
import { productsAPI, Category } from "@/api/products";

export interface SelectedProduct {
  id: number;
  name: string;
  slug: string;
}

export enum PageType {
  BASIC = "basic",
  PRODUCTS = "products",
  NONE = "none",
}

export const useImageSelect = () => {
  const pathname = usePathname();

  // 페이지 타입 결정
  const pageType = pathname?.includes("/settings/basic")
    ? PageType.BASIC
    : pathname?.includes("/settings/products")
    ? PageType.PRODUCTS
    : PageType.NONE;

  // 상태 관리
  const [uploadedImages, setUploadedImages] = useState<MainImage[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 메인 이미지 데이터 로드
  const loadMainImages = useCallback(async () => {
    try {
      const response = await homeSettingsAPI.getMainImages();

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "이미지 데이터를 불러올 수 없습니다."
        );
      }

      // order 값으로 정렬
      const sortedImages = response.data.sort((a, b) => a.order - b.order);
      setUploadedImages(sortedImages);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "이미지 데이터를 불러오는데 실패했습니다.";

      console.error("Failed to fetch images:", err);
      setError(errorMessage);
    }
  }, []);

  // 카테고리 데이터 로드
  const loadCategories = useCallback(async () => {
    try {
      const response = await productsAPI.getLevel1Categories();

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "카테고리 데이터를 불러올 수 없습니다."
        );
      }

      const filteredCategories = response.data.filter(
        (category) => category.slug !== "catalogue"
      );

      setCategories(filteredCategories);

      const initialSelectedProducts = filteredCategories.map(
        (category, index) => ({
          id: index,
          name: category.name,
          slug: category.slug,
        })
      );
      setSelectedProducts(initialSelectedProducts);

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "카테고리 데이터를 불러오는데 실패했습니다.";

      console.error("Failed to fetch categories:", err);
      setError(errorMessage);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (pageType === PageType.BASIC) {
        await loadMainImages();
      } else if (pageType === PageType.PRODUCTS) {
        await loadCategories();
      }

      setIsLoading(false);
    };

    fetchData();
  }, [pageType, loadCategories, loadMainImages]);

  // 드래그 시작
  const handleDragStart = useCallback((index: number) => {
    setDraggedItem(index);
  }, []);

  // 이미지 순서 변경
  const handleImageOrderUpdate = useCallback(
    async (dropIndex: number) => {
      if (draggedItem === null) return;

      const updatedImages = [...uploadedImages];
      const [draggedImage] = updatedImages.splice(draggedItem, 1);
      updatedImages.splice(dropIndex, 0, draggedImage);
      setUploadedImages(updatedImages);
      setDraggedItem(null);

      try {
        const imageUrls = updatedImages.map((img) => img.url);
        const response = await homeSettingsAPI.updateImageOrder({ imageUrls });

        if (!response.success) {
          throw new Error(
            response.message || "이미지 순서 변경에 실패했습니다."
          );
        }

        setError(null);

        // 순서 변경 성공 후 최신 데이터 다시 로드
        await loadMainImages();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "이미지 순서 변경 중 오류가 발생했습니다.";

        console.error("Update image order error:", err);
        setError(errorMessage);
      }
    },
    [draggedItem, uploadedImages, loadMainImages]
  );

  // 카테고리 순서 변경
  const handleCategoryOrderUpdate = useCallback(
    async (dropIndex: number) => {
      if (draggedItem === null) return;

      const updatedProducts = [...selectedProducts];
      const [draggedProduct] = updatedProducts.splice(draggedItem, 1);
      updatedProducts.splice(dropIndex, 0, draggedProduct);
      setSelectedProducts(updatedProducts);
      setDraggedItem(null);

      try {
        console.log(
          "Updating category order:",
          updatedProducts.map((p, i) => ({ slug: p.slug, order: i }))
        );

        const updatePromises = updatedProducts.map((product, index) => {
          console.log(`API call - slug: ${product.slug}, order: ${index}`);
          return productsAPI.updateCategoryOrder(product.slug, index);
        });

        const results = await Promise.all(updatePromises);
        console.log("Update results:", results);

        setError(null);

        // 순서 변경 성공 후 최신 데이터 다시 로드
        await loadCategories();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "카테고리 순서 변경 중 오류가 발생했습니다.";

        console.error("Update category order error:", err);
        setError(errorMessage);
      }
    },
    [draggedItem, selectedProducts, loadCategories]
  );

  // 카테고리 삭제 (products 페이지에서 사용)
  const handleProductDelete = useCallback(
    async (slug: string) => {
      try {
        console.log(`Deleting category with slug: ${slug}`);

        const response = await productsAPI.deleteCategory(slug);

        if (!response.success) {
          throw new Error(response.message || "카테고리 삭제에 실패했습니다.");
        }

        setError(null);

        // 삭제 성공 후 최신 데이터 다시 로드
        await loadCategories();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "카테고리 삭제 중 오류가 발생했습니다.";

        console.error("Delete category error:", err);
        setError(errorMessage);
        throw err; // 에러를 다시 throw하여 호출자에게 전달
      }
    },
    [loadCategories]
  );

  return {
    pageType,
    uploadedImages,
    setUploadedImages,
    selectedProducts,
    setSelectedProducts,
    categories,
    draggedItem,
    isLoading,
    error,
    handleDragStart,
    handleImageOrderUpdate,
    handleCategoryOrderUpdate,
    handleProductDelete,
  };
};
