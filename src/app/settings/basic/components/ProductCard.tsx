"use client";

import Link from "next/link";
import RequestCard from "../../products/components/ReeustCard";

interface ProductCardProps {
  products: { name: string; content?: string; img: string; slug?: string }[];
  selectedProducts: { id: number; name: string; slug: string }[];
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<{ id: number; name: string; slug: string }[]>
  >;
  maxProducts?: number;
  onDelete?: (slug: string) => Promise<void>;
}

export default function ProductCard({
  products,
  selectedProducts,
  setSelectedProducts,
  maxProducts = 5,
  onDelete,
}: ProductCardProps) {
  const handleProductClick = (productName: string, productSlug: string) => {
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
          { id: Date.now(), name: productName, slug: productSlug },
        ]);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();

    if (!onDelete) return;

    const confirmed = window.confirm("정말 이 제품을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await onDelete(slug);
    } catch (error) {
      console.error("Delete error:", error);
      alert("제품 삭제에 실패했습니다.");
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
              onClick={() =>
                handleProductClick(product.name, product.slug || product.name)
              }
              className={`flex flex-col w-full border-[1px] rounded-[12px] p-[20px] cursor-pointer duration-300 border-[#D4D4D4] bg-[#Fff] hover:border-[#0089D1] 
            
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

              {/* 하단: 제품 수정하기 링크 및 삭제 버튼 */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/settings/products/setting?slug=${encodeURIComponent(
                    product.slug || product.name
                  )}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#0089D1] text-[14px]  font-[600] pretendard hover:underline flex items-center gap-[4px]"
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

                {/* 삭제 버튼 */}
                {/* {onDelete && product.slug && (
                  <button
                    onClick={(e) => handleDelete(e, product.slug!)}
                    className="text-[#DC2626] text-[14px] font-[600] pretendard hover:underline flex items-center gap-[4px]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z"
                        stroke="#DC2626"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    삭제
                  </button>
                )} */}
              </div>
            </div>
          );
        })}

        <RequestCard />
      </div>
    </div>
  );
}
