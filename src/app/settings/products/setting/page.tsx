"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  productsAPI,
  ProductCreateRequest,
  ProductUpdateRequest,
  Level2SubCategory,
  Level3Product,
} from "@/api/products";
import { useLevel2Categories } from "../../hooks/useCategory";
import SingleImageSlot from "./components/SingleImageSlot";
import DraggableList from "../../components/DraggableList";

function ProductSettingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams?.get("slug");
  const mode = searchParams?.get("mode");
  const isCreateMode = mode === "create";

  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    categories: level2Categories,
    loading,
    errors,
  } = useLevel2Categories(slug || "");

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    content: "",
    imageUrl: "",
    isActive: true,
  });

  const [selectedSubProducts, setSelectedSubProducts] = useState<string[]>([]);

  // Level 2 서브카테고리 상태
  const [level2SubCategories, setLevel2SubCategories] = useState<
    Level2SubCategory[]
  >([]);
  const [isLoadingLevel2, setIsLoadingLevel2] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Level 3 제품 목록 상태
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [level3Products, setLevel3Products] = useState<Level3Product[]>([]);
  const [isLoadingLevel3, setIsLoadingLevel3] = useState(false);

  // Level 1 카테고리 데이터 로드 (수정 모드일 때)
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!slug || isCreateMode) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Level 1 카테고리 목록을 가져와서 해당 slug의 데이터를 찾음
        const response = await productsAPI.getLevel1Categories();

        if (response.success && response.data?.items) {
          const category = response.data.items.find((cat) => cat.slug === slug);

          if (category) {
            setFormData({
              slug: category.slug,
              name: category.name,
              content: category.content || "",
              imageUrl: category.imageUrl || "",
              isActive: category.isActive,
            });
          } else {
            setError("카테고리를 찾을 수 없습니다.");
          }
        } else {
          setError("카테고리 데이터를 불러올 수 없습니다.");
        }
      } catch (err: any) {
        console.error("Failed to load category data:", err);
        setError(
          err.response?.data?.message ||
            "카테고리 데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [slug, isCreateMode]);

  // Level 2 서브카테고리 데이터 로드
  useEffect(() => {
    const loadLevel2Data = async () => {
      if (!slug || isCreateMode) {
        return;
      }

      setIsLoadingLevel2(true);

      try {
        const response = await productsAPI.getLevel2Categories(slug);

        if (response.success && response.data?.subCategories) {
          // order로 정렬
          const sortedSubCategories = response.data.subCategories.sort(
            (a, b) => a.order - b.order
          );
          setLevel2SubCategories(sortedSubCategories);

          // 첫 번째 탭을 기본 선택
          if (sortedSubCategories.length > 0 && !selectedTab) {
            setSelectedTab(sortedSubCategories[0].slug);
          }
        }
      } catch (err: any) {
        console.error("Failed to load level 2 categories:", err);
      } finally {
        setIsLoadingLevel2(false);
      }
    };

    loadLevel2Data();
  }, [slug, isCreateMode, selectedTab]);

  // Level 3 제품 목록 로드 (선택된 탭이 변경될 때)
  useEffect(() => {
    const loadLevel3Products = async () => {
      if (!selectedTab) return;

      setIsLoadingLevel3(true);

      try {
        const response = await productsAPI.getLevel3Products(selectedTab);

        if (response.success && response.data?.items) {
          setLevel3Products(response.data.items);
        }
      } catch (err: any) {
        console.error("Failed to load level 3 products:", err);
      } finally {
        setIsLoadingLevel3(false);
      }
    };

    loadLevel3Products();
  }, [selectedTab]);

  const handleSubProductClick = (productName: string) => {
    if (selectedSubProducts.includes(productName)) {
      setSelectedSubProducts(
        selectedSubProducts.filter((p) => p !== productName)
      );
    } else {
      setSelectedSubProducts([...selectedSubProducts, productName]);
    }
  };

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // Level 2 카테고리 순서 변경
  const handleLevel2OrderUpdate = async (dropIndex: number) => {
    if (draggedItem === null || !slug) return;

    const updatedCategories = [...level2SubCategories];
    const [draggedCategory] = updatedCategories.splice(draggedItem, 1);
    updatedCategories.splice(dropIndex, 0, draggedCategory);
    setLevel2SubCategories(updatedCategories);
    setDraggedItem(null);

    try {
      // Level 2 카테고리 일괄 순서 변경 API 사용
      const items = updatedCategories.map((category, index) => ({
        slug: category.slug,
        order: index,
      }));

      const response = await productsAPI.reorderLevel2Categories(slug, items);

      if (!response.success) {
        throw new Error(
          response.message || "카테고리 순서 변경에 실패했습니다."
        );
      }

      // 순서 변경 성공 후 최신 데이터 다시 로드
      const refreshResponse = await productsAPI.getLevel2Categories(slug);
      if (refreshResponse.success && refreshResponse.data?.subCategories) {
        const sortedSubCategories = refreshResponse.data.subCategories.sort(
          (a, b) => a.order - b.order
        );
        setLevel2SubCategories(sortedSubCategories);
      }
    } catch (err: any) {
      console.error("Update level 2 category order error:", err);
      setError(err.message || "카테고리 순서 변경 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      if (!slug) {
        setError("카테고리 slug가 없습니다.");
        return;
      }

      // Level 1 카테고리 정보 수정
      const requestData = {
        name: formData.name,
        content: formData.content,
        imageUrl: formData.imageUrl,
        isActive: formData.isActive,
      };

      const response = await productsAPI.updateLevel1Category(
        slug,
        requestData
      );

      if (response.success) {
        setSuccessMessage("카테고리가 성공적으로 수정되었습니다.");

        // 데이터 새로고침
        const refreshResponse = await productsAPI.getLevel1Categories();
        if (refreshResponse.success && refreshResponse.data?.items) {
          const category = refreshResponse.data.items.find(
            (cat) => cat.slug === slug
          );
          if (category) {
            setFormData({
              slug: category.slug,
              name: category.name,
              content: category.content || "",
              imageUrl: category.imageUrl || "",
              isActive: category.isActive,
            });
          }
        }
      } else {
        setError(response.message || "카테고리 수정에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.message || "요청 처리 중 오류가 발생했습니다."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[40px] pretendard p-[40px]">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <section className="w-full flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h2 className="text-[24px] font-[700] text-[#171717]">
            {isCreateMode ? "카테고리 추가" : formData.name || "카테고리 수정"}
          </h2>
          <span className="text-[14px] font-[500] text-[#737373]">
            {isCreateMode ? "새 카테고리를 추가합니다." : "수정페이지 입니다."}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[40px]">
          <SingleImageSlot
            imageUrl={formData.imageUrl}
            onImageUpdate={(newImageUrl) =>
              setFormData({ ...formData, imageUrl: newImageUrl })
            }
            altText={formData.name}
          />

          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품명 (영문)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="Product Name"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품 설명
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full h-[175px] px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1] resize-none"
                placeholder="Product Description"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                중간카테고리 설정
              </label>
              <DraggableList
                items={level2SubCategories.map((cat) => ({
                  id: cat.order,
                  name: cat.name,
                  slug: cat.slug,
                }))}
                draggedIndex={draggedItem}
                hint="카테고리 순서를 드래그 해서 설정해보세요"
                onDragStart={handleDragStart}
                onDrop={handleLevel2OrderUpdate}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-[24px]">
          <div className="flex gap-[12px]">
            <button
              onClick={handleSubmit}
              className="px-[32px] py-[12px] bg-[#0089D1] text-white rounded-[8px] text-[14px] font-[600] hover:bg-[#0077B8]"
            >
              {isCreateMode ? "카테고리 추가하기" : "카테고리 수정 완료하기"}
            </button>
            {!isCreateMode && (
              <button className="px-[32px] py-[12px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]">
                카테고리 삭제하기
              </button>
            )}
          </div>
        </div>
      </section>

      {!isCreateMode && (
        <>
          <hr className="border-t border-[#D4D4D4]" />

          <section className="w-full flex flex-col gap-[24px]">
            <div className="flex items-center gap-[12px]">
              <h2 className="text-[24px] font-[700] text-[#171717]">
                {formData.name}
              </h2>
              <span className="text-[16px] font-[500] text-[#2B7FFF]">
                하위 제품분류 설정페이지
              </span>
            </div>
            <div className="flex ">
              <div className="flex flex-col gap-[16px]">
                <div className="flex gap-[12px]">
                  {level2SubCategories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedTab(category.slug)}
                      className={`px-[24px] py-[12px] rounded-[8px] text-[14px] font-[600] ${
                        selectedTab === category.slug
                          ? "bg-[#0089D1] text-white"
                          : "bg-white border border-[#D4D4D4] text-[#404040] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                <h3 className="text-[20px] font-[700] text-[#404040]">
                  하위 제품 설정
                  <span className="text-[16px] font-[500] text-[#0089D1] ml-[12px]">
                    {isLoadingLevel3
                      ? "로딩 중..."
                      : `총 ${level3Products.length}개의 제품`}
                  </span>
                </h3>

                {isLoadingLevel3 ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-gray-500">제품 목록을 불러오는 중...</p>
                  </div>
                ) : level3Products.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-gray-500">등록된 제품이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {level3Products.map((product) => {
                      const isSelected = selectedSubProducts.includes(
                        product.slug
                      );
                      return (
                        <div
                          key={product.slug}
                          onClick={() => handleSubProductClick(product.slug)}
                          className={`flex flex-col w-full border-[1px] rounded-[12px] p-[20px] cursor-pointer duration-300 ${
                            isSelected
                              ? "border-[#0089D1] bg-[#E6F3FA]"
                              : "border-[#D4D4D4] bg-[#FAFAFA] hover:border-[#0089D1] hover:bg-[#E6F3FA]"
                          }`}
                        >
                          <h4 className="text-[18px] font-[700] text-[#404040] mb-[12px]">
                            {product.productName}
                          </h4>
                          <p className="text-[12px] font-[500] text-[#0089D1] mb-[16px] line-clamp-2">
                            {product.description || "설명이 없습니다."}
                          </p>
                          <div className="flex-1 flex items-center justify-center mb-[16px]">
                            <img
                              src={product.mainImageUrl}
                              alt={product.productName}
                              className="w-full h-[140px] object-contain"
                            />
                          </div>
                          <Link
                            href={`/settings/products/setting?slug=${product.slug}&mode=edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="self-end text-[#0089D1] text-[14px] font-[600] hover:underline flex items-center gap-[4px]"
                          >
                            제품 수정하기
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
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
                )}
              </div>
              <div>이미지 드래그 영역(DND)</div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function ProductSettingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProductSettingContent />
    </Suspense>
  );
}
