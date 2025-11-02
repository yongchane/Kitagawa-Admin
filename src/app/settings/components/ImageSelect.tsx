"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ImageSlot from "@/app/settings/basic/components/ImageSlot";
import ProductCard from "@/app/settings/basic/components/ProductCard";
import { homeSettingsAPI, MainImage } from "@/api/homeSettings";
import { productsAPI, Category } from "@/api/products";

interface SelectedProduct {
  id: number;
  name: string;
}

export default function ImageSelect() {
  const pathname = usePathname();
  const isBasicPage = pathname?.includes("/settings/basic");
  const isProductsPage = pathname?.includes("/settings/products");

  // 디버깅용 로그
  console.log("Current pathname:", pathname);
  console.log("isBasicPage:", isBasicPage);
  console.log("isProductsPage:", isProductsPage);

  // 이미지 상태 (basic 페이지용)
  const [uploadedImages, setUploadedImages] = useState<MainImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 제품 상태 (products 페이지용)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  // API에서 가져온 제품 카테고리 데이터
  const [categories, setCategories] = useState<Category[]>([]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 초기 로딩 및 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // products 페이지인 경우 카테고리 데이터 로드
      if (isProductsPage) {
        try {
          const response = await productsAPI.getLevel1Categories();
          if (response.success && response.data) {
            // catalogue를 제외한 카테고리만 필터링
            const filteredCategories = response.data.filter(
              (category) => category.slug !== 'catalogue'
            );
            setCategories(filteredCategories);
          }
        } catch (err: any) {
          console.error("Failed to fetch categories:", err);
          setError(
            err.response?.data?.message ||
              "카테고리 데이터를 불러오는데 실패했습니다."
          );
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [isProductsPage]);

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // 드롭 핸들러 (이미지용)
  const handleImageDrop = async (dropIndex: number) => {
    if (draggedItem === null) return;

    // UI 먼저 업데이트
    const updatedImages = [...uploadedImages];
    const [draggedImage] = updatedImages.splice(draggedItem, 1);
    updatedImages.splice(dropIndex, 0, draggedImage);
    setUploadedImages(updatedImages);
    setDraggedItem(null);

    // API 호출하여 순서 저장
    try {
      const imageUrls = updatedImages.map((img) => img.url);
      const response = await homeSettingsAPI.updateImageOrder({ imageUrls });

      if (!response.success) {
        // 실패 시 에러 표시
        setError(response.message || "이미지 순서 변경에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Update order error:", err);
      setError(
        err.response?.data?.message ||
          "이미지 순서 변경 중 오류가 발생했습니다."
      );
    }
  };

  // 드롭 핸들러 (제품용)
  const handleProductDrop = (dropIndex: number) => {
    if (draggedItem === null) return;

    setSelectedProducts((prev) => {
      const updated = [...prev];
      const [draggedProduct] = updated.splice(draggedItem, 1);
      updated.splice(dropIndex, 0, draggedProduct);
      return updated;
    });

    setDraggedItem(null);
  };

  // 현재 페이지에 따라 사용할 데이터와 핸들러 결정
  const currentItems = isBasicPage ? uploadedImages : selectedProducts;
  const handleDrop = isBasicPage ? handleImageDrop : handleProductDrop;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="w-full flex flex-row justify-between gap-[14%]">
        {/* 왼쪽: 이미지 슬롯 또는 제품 카드 영역 */}
        {isBasicPage && !isProductsPage ? (
          <ImageSlot
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            maxImages={5}
          />
        ) : isProductsPage ? (
          <ProductCard
            products={categories.map((cat) => ({
              name: cat.name,
              content: cat.content,
              img: cat.imageUrl,
              slug: cat.slug,
            }))}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            maxProducts={5}
          />
        ) : null}

        {/* 오른쪽: 드래그 리스트 영역 */}
        <div className="flex-1 bg-[#F5F5F5] border border-[#D4D4D4] rounded-lg pt-[16px] h-fit">
          <p className="text-blue-500 text-sm px-[16px] py-[12px]">
            {isBasicPage
              ? "이미지 순서를 드래그 해서 설정해보세요"
              : "제품 순서를 드래그 해서 설정해보세요"}
          </p>

          {currentItems.length !== 0 && (
            <div className="">
              {currentItems.map((item, index) => {
                // MainImage 타입 체크
                const isMainImage = "url" in item;
                const displayName = isMainImage
                  ? item.altKo || item.alt
                  : item.name;

                return (
                  <div
                    key={isMainImage ? item.url : item.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    className={`bg-[#F5F5F5] border border-gray-200 p-3 flex items-center gap-3 cursor-move hover:bg-gray-50 transition-colors ${
                      draggedItem === index ? "opacity-50" : ""
                    }`}
                  >
                    {/* 드래그 핸들 아이콘 */}
                    <div className="text-gray-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path
                          d="M2 4h12M2 8h12M2 12h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* 파일명 또는 제품명 */}
                    <span className="text-sm text-gray-700 truncate">
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* 페이지네이션 표시 */}
      <div className="text-center mt-4 text-[#737373] font-[500] text-[16px]">
        {currentItems.length}/5
      </div>
    </div>
  );
}
