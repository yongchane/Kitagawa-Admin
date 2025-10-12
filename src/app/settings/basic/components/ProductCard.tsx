"use client";

import Link from "next/link";

interface ProductCardProps {
  products: { name: string; content?: string; img: string }[];
  selectedProducts: { id: number; name: string }[];
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<{ id: number; name: string }[]>
  >;
  maxProducts?: number;
}

export default function ProductCard({
  products,
  selectedProducts,
  setSelectedProducts,
  maxProducts = 5,
}: ProductCardProps) {
  const handleProductClick = (productName: string) => {
    // 이미 선택된 제품인지 확인
    const isSelected = selectedProducts.some(
      (product) => product.name === productName
    );

    if (isSelected) {
      // 이미 선택된 경우 선택 해제
      setSelectedProducts((prev) =>
        prev.filter((product) => product.name !== productName)
      );
    } else {
      // 최대 개수 체크
      if (selectedProducts.length < maxProducts) {
        // 선택 추가
        setSelectedProducts((prev) => [
          ...prev,
          { id: Date.now(), name: productName },
        ]);
      }
    }
  };

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => {
          const isSelected = selectedProducts.some(
            (selected) => selected.name === product.name
          );
          const canAddMore = selectedProducts.length < maxProducts;

          return (
            <div
              key={product.name}
              onClick={() => handleProductClick(product.name)}
              className={`flex flex-col w-full border-[1px] rounded-[12px] p-[20px] cursor-pointer duration-300
                ${
                  isSelected
                    ? "border-[#0089D1] bg-[#E6F3FA]"
                    : "border-[#D4D4D4] bg-[#FAFAFA] hover:border-[#0089D1] hover:bg-[#E6F3FA]"
                }
                ${!canAddMore && !isSelected && "opacity-50 cursor-not-allowed"}
              `}
            >
              {/* 상단: 제목과 설명 */}
              <div className="flex flex-col gap-[8px] mb-[16px]">
                <h3 className="text-[20px] font-[700] text-[#404040] pretendard">
                  {product.name}
                </h3>
                {product.content && (
                  <p className="text-[12px] font-[500] text-[#0089D1] pretendard">
                    {product.content}
                  </p>
                )}
              </div>

              {/* 중앙: 이미지 */}
              <div className="flex-1 flex items-center justify-center mb-[16px]">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-[190px] object-contain"
                />
              </div>

              {/* 하단: 제품 수정하기 링크 */}
              <Link
                href={`/settings/products/setting?product=${encodeURIComponent(
                  product.name
                )}`}
                onClick={(e) => e.stopPropagation()}
                className="self-end text-[#0089D1] text-[14px] font-[600] pretendard hover:underline flex items-center gap-[4px]"
              >
                제품 수정하기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="#0089D1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
