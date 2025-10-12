"use client";

// 이미지 업로드 api 연동 필요
// 인터렉션 수정 필요

import { useState } from "react";
import { usePathname } from "next/navigation";
import ImageSlot, {
  UploadedImage,
} from "@/app/settings/basic/components/ImageSlot";
import ProductCard from "@/app/settings/basic/components/ProductCard";

// 임시 제품 데이터 (나중에 API로 대체)
const mockProducts = [
  {
    name: "Nc Rotary table",
    content: "Compact & high accuracy Combination with chuck is available.",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
  {
    name: "Vise",
    content: "Compact & high accuracy Combination with chuck is available.",
    img: "https://www.kitagawa.com/en/mtools/item/itemCatImg06.jpg",
  },
  {
    name: "Chuck",
    content: "Compact & high accuracy Combination with chuck is available.",
    img: "https://www.kitagawa.com/en/mtools/item/BR08_right.jpg",
  },
  {
    name: "Cylinder",
    content: "Compact & high accuracy Combination with chuck is available.",
    img: "https://www.kitagawa.com/en/mtools/item/data/IMG/SR1677C.jpg",
  },
  {
    name: "Work gripper",
    content: "Compact & high accuracy Combination with chuck is available.",
    img: "https://www.kitagawa.com/en/mtools/item/itemCatImg07.jpg",
  },
];

interface SelectedProduct {
  id: number;
  name: string;
}

export default function ImageSelect() {
  const pathname = usePathname();
  const isBasicPage = pathname?.includes("/settings/basic");
  const isProductsPage = pathname?.includes("/settings/products");

  // 이미지 상태 (basic 페이지용)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // 제품 상태 (products 페이지용)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // 드롭 핸들러 (이미지용)
  const handleImageDrop = (dropIndex: number) => {
    if (draggedItem === null) return;

    setUploadedImages((prev) => {
      const updated = [...prev];
      const [draggedImage] = updated.splice(draggedItem, 1);
      updated.splice(dropIndex, 0, draggedImage);
      return updated;
    });

    setDraggedItem(null);
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

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-row justify-between gap-[14%]">
        {/* 왼쪽: 이미지 슬롯 또는 제품 카드 영역 */}
        {isBasicPage ? (
          <ImageSlot
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            maxImages={5}
          />
        ) : isProductsPage ? (
          <ProductCard
            products={mockProducts}
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
              {currentItems.map((item, index) => (
                <div
                  key={item.id}
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
                    {"file" in item ? item.file.name : item.name}
                  </span>
                </div>
              ))}
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
