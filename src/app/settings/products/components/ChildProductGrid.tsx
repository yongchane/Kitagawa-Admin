"use client";

import { CategoryChild } from "@/api/products";
import Image from "next/image";

interface ChildProductGridProps {
  products: CategoryChild[];
  onSelectProduct: (product: CategoryChild) => void;
  onAddNew?: () => void;
}

export default function ChildProductGrid({
  products,
  onSelectProduct,
  onAddNew,
}: ChildProductGridProps) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-700 mb-3">
        하위 프로젝트 설정
      </h3>
      <p className="text-sm text-blue-500 mb-4">
        최소 3개의 제품을 설정해주세요
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* 기존 제품들 */}
        {products.map((product) => (
          <button
            key={product.slug}
            onClick={() => onSelectProduct(product)}
            className="group relative border-2 border-blue-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all bg-white"
          >
            {/* 제품 이미지 */}
            <div className="aspect-square relative mb-3 bg-gray-100 rounded-md overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* 제품명 */}
            <p className="text-sm font-medium text-gray-900 text-center truncate">
              {product.name}
            </p>

            {/* 제품 수정하기 버튼 */}
            <div className="mt-2 text-xs text-blue-600 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              제품 수정하기 →
            </div>
          </button>
        ))}

        {/* 제품 추가 카드 */}
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center aspect-square text-gray-500 hover:text-blue-600"
          >
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium">제품 추가</span>
          </button>
        )}
      </div>
    </div>
  );
}
