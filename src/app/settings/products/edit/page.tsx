"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  productsAPI,
  Level2Category,
  CategoryChild,
} from "@/api/products";
import CategoryTabSelector from "../components/CategoryTabSelector";
import ChildProductGrid from "../components/ChildProductGrid";
import ProductDetailForm, {
  ProductFormData,
} from "../components/ProductDetailForm";

function ProductEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams?.get("slug"); // 대분류 slug (예: nc-rotary-table)

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Level2Category[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<Level2Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CategoryChild | null>(
    null
  );
  const [showDetailForm, setShowDetailForm] = useState(false);

  // Level 2 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (!slug) {
        setError("제품 slug가 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productsAPI.getLevel2CategoriesBySlug(slug);

        if (response.success && response.data) {
          setCategories(response.data);
          // 첫 번째 카테고리 자동 선택
          if (response.data.length > 0) {
            setSelectedCategory(response.data[0]);
          }
        } else {
          setError(response.message || "카테고리를 불러올 수 없습니다.");
        }
      } catch (err: any) {
        console.error("Failed to load categories:", err);
        setError("카테고리를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [slug]);

  // 제품 선택 핸들러
  const handleSelectProduct = (product: CategoryChild) => {
    setSelectedProduct(product);
    setShowDetailForm(true);
  };

  // 제품 추가 핸들러
  const handleAddNewProduct = () => {
    setSelectedProduct(null);
    setShowDetailForm(true);
  };

  // 제품 저장 핸들러
  const handleSubmitProduct = async (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        // 기존 제품 수정
        const response = await productsAPI.updateProduct(
          selectedProduct.slug,
          {
            productName: data.productName,
            category: {
              mainCategory: data.mainCategory,
              subCategory: data.subCategory,
              series: "",
            },
            sourceUrl: data.sourceUrl,
            mainImageUrl: data.sourceUrl,
            pdfUrl: data.pdfUrl,
          }
        );

        if (response.success) {
          alert("제품이 수정되었습니다.");
          setShowDetailForm(false);
          // 데이터 새로고침
          window.location.reload();
        } else {
          alert(response.message || "제품 수정에 실패했습니다.");
        }
      } else {
        // 새 제품 생성
        const response = await productsAPI.createProduct({
          slug: data.slug || `${data.mainCategory}-${Date.now()}`,
          productName: data.productName,
          productNameKo: data.productName,
          category: {
            mainCategory: data.mainCategory,
            subCategory: data.subCategory,
            series: "",
          },
          sourceUrl: data.sourceUrl,
          mainImageUrl: data.sourceUrl,
          pdfUrl: data.pdfUrl,
          isActive: true,
        });

        if (response.success) {
          alert("제품이 추가되었습니다.");
          setShowDetailForm(false);
          // 데이터 새로고침
          window.location.reload();
        } else {
          alert(response.message || "제품 추가에 실패했습니다.");
        }
      }
    } catch (error: any) {
      console.error("Product save error:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 취소/삭제 핸들러
  const handleCancel = () => {
    if (selectedProduct) {
      if (confirm("정말 이 제품을 삭제하시겠습니까?")) {
        // TODO: 제품 삭제 API 호출
        productsAPI
          .deleteProduct(selectedProduct.slug)
          .then(() => {
            alert("제품이 삭제되었습니다.");
            setShowDetailForm(false);
            window.location.reload();
          })
          .catch(() => {
            alert("제품 삭제에 실패했습니다.");
          });
      }
    } else {
      setShowDetailForm(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
        <Link
          href="/settings/products"
          className="inline-block mt-4 text-blue-600 hover:underline"
        >
          ← 뒤로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          href="/settings/products"
          className="inline-flex items-center text-blue-600 hover:underline mb-4"
        >
          ← 제품 설정으로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">
          {selectedCategory?.parentLevelCategory || "제품"} 설정
        </h1>
        <p className="text-gray-600 mt-1">
          하위 제품을 설정하고 관리합니다.
        </p>
      </div>

      {/* 카테고리 탭 선택 */}
      <CategoryTabSelector
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 하위 제품 그리드 */}
      {selectedCategory && (
        <ChildProductGrid
          products={selectedCategory.children}
          onSelectProduct={handleSelectProduct}
          onAddNew={handleAddNewProduct}
        />
      )}

      {/* 제품 상세 폼 (모달 또는 별도 섹션) */}
      {showDetailForm && (
        <div className="mt-8">
          <ProductDetailForm
            initialData={
              selectedProduct
                ? {
                    slug: selectedProduct.slug,
                    productName: selectedProduct.name,
                    mainCategory: selectedCategory?.name || "",
                    subCategory: selectedCategory?.nameKo || "",
                    sourceUrl: selectedProduct.imageUrl,
                    mainImageUrl: selectedProduct.imageUrl,
                    pdfUrl: "",
                  }
                : {
                    subCategory: selectedCategory?.nameKo || "",
                  }
            }
            categoryName={selectedCategory?.nameKo || ""}
            onSubmit={handleSubmitProduct}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductEditPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      }
    >
      <ProductEditContent />
    </Suspense>
  );
}
