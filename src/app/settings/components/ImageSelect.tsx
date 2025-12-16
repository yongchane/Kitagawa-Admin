"use client";

import ImageSlot from "@/app/settings/basic/components/ImageSlot";
import ProductCard from "@/app/settings/basic/components/ProductCard";
import DraggableList from "./DraggableList";
import { useImageSelect, PageType } from "../hooks/useImageSelect";

export default function ImageSelect() {
  const {
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
    loadMainImages,
  } = useImageSelect();

  // 페이지별 설정
  const getPageConfig = () => {
    switch (pageType) {
      case PageType.BASIC:
        return {
          items: uploadedImages,
          handleDrop: handleImageOrderUpdate,
          renderLeft: (
            <ImageSlot
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              maxImages={5}
              onRefresh={loadMainImages}
            />
          ),
          dragHint: "이미지 순서를 드래그 해서 설정해보세요",
        };

      case PageType.PRODUCTS:
        return {
          items: selectedProducts,
          handleDrop: handleCategoryOrderUpdate,
          renderLeft: (
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
              onDelete={handleProductDelete}
            />
          ),
          dragHint: "제품 순서를 드래그 해서 설정해보세요",
        };

      default:
        return {
          items: [],
          handleDrop: () => {},
          renderLeft: null,
          dragHint: "",
        };
    }
  };

  const config = getPageConfig();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="w-full flex flex-row justify-between gap-[14%]">
        {/* 왼쪽: 페이지별 컨텐츠 */}
        {config.renderLeft}

        {/* 오른쪽: 드래그 리스트 */}
        <DraggableList
          items={config.items}
          draggedIndex={draggedItem}
          hint={config.dragHint}
          onDragStart={handleDragStart}
          onDrop={config.handleDrop}
        />
      </div>

      {/* 페이지네이션 */}
      <div className="text-center mt-4 text-[#737373] font-[500] text-[16px]">
        {config.items.length}/5
      </div>
    </div>
  );
}
