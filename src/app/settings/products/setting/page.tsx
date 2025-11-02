"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productsAPI, ProductCreateRequest, ProductUpdateRequest } from "@/api/products";

const mockSubProducts = [
  {
    name: "MR series",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
  {
    name: "MK series",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
  {
    name: "MX series",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
  {
    name: "CK/CK(R) series",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
  {
    name: "GT series",
    img: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
  },
];

function ProductSettingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams?.get("slug");
  const mode = searchParams?.get("mode");
  const isCreateMode = mode === "create";

  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    productNameKo: "",
    mainCategory: "",
    subCategory: "",
    series: "",
    sourceUrl: "",
    imageUrls: [] as string[],
    mainImageUrl: "",
    specificationHtml: "",
    tags: [] as string[],
    isActive: true,
    isFeatured: false,
    priority: 0,
    pdfUrl: "",
    youtubeUrl: "",
  });

  const [selectedSubProducts, setSelectedSubProducts] = useState<string[]>([]);

  // 제품 데이터 로드 (수정 모드일 때)
  useEffect(() => {
    const loadProductData = async () => {
      if (!slug || isCreateMode) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: slug로 제품 데이터를 가져오는 API가 있다면 여기서 호출
        // 현재는 기본값 설정
        setFormData({
          productName: slug,
          productNameKo: slug,
          mainCategory: "",
          subCategory: "",
          series: "",
          sourceUrl: "",
          imageUrls: [],
          mainImageUrl: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
          specificationHtml: "",
          tags: [],
          isActive: true,
          isFeatured: false,
          priority: 0,
          pdfUrl: "",
          youtubeUrl: "",
        });
      } catch (err: any) {
        console.error("Failed to load product data:", err);
        setError(
          err.response?.data?.message || "제품 데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [slug, isCreateMode]);

  const handleSubProductClick = (productName: string) => {
    if (selectedSubProducts.includes(productName)) {
      setSelectedSubProducts(selectedSubProducts.filter((p) => p !== productName));
    } else {
      setSelectedSubProducts([...selectedSubProducts, productName]);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      if (isCreateMode) {
        // 제품 생성
        const requestData: ProductCreateRequest = {
          productName: formData.productName,
          productNameKo: formData.productNameKo,
          category: {
            mainCategory: formData.mainCategory,
            subCategory: formData.subCategory,
            series: formData.series,
          },
          sourceUrl: formData.sourceUrl || undefined,
          imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
          mainImageUrl: formData.mainImageUrl || undefined,
          specificationHtml: formData.specificationHtml || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          priority: formData.priority,
          pdfUrl: formData.pdfUrl || undefined,
          youtubeUrl: formData.youtubeUrl || undefined,
        };

        const response = await productsAPI.createProduct(requestData);

        if (response.success) {
          setSuccessMessage("제품이 성공적으로 생성되었습니다.");
          // 성공 후 제품 목록으로 이동
          setTimeout(() => {
            router.push("/settings/products");
          }, 1500);
        } else {
          setError(response.message || "제품 생성에 실패했습니다.");
        }
      } else if (slug) {
        // 제품 수정
        const requestData: ProductUpdateRequest = {
          productName: formData.productName,
          productNameKo: formData.productNameKo,
          category: {
            mainCategory: formData.mainCategory,
            subCategory: formData.subCategory,
            series: formData.series,
          },
          sourceUrl: formData.sourceUrl || undefined,
          imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
          mainImageUrl: formData.mainImageUrl || undefined,
          specificationHtml: formData.specificationHtml || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          priority: formData.priority,
          pdfUrl: formData.pdfUrl || undefined,
          youtubeUrl: formData.youtubeUrl || undefined,
        };

        const response = await productsAPI.updateProduct(slug, requestData);

        if (response.success) {
          setSuccessMessage("제품이 성공적으로 수정되었습니다.");
        } else {
          setError(response.message || "제품 수정에 실패했습니다.");
        }
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
            {isCreateMode ? "제품 추가" : formData.productName || "제품 수정"}
          </h2>
          <span className="text-[14px] font-[500] text-[#737373]">
            {isCreateMode ? "새 제품을 추가합니다." : "수정페이지 입니다."}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[40px]">
          <div className="flex flex-col gap-[12px]">
            <label className="text-[16px] font-[600] text-[#404040]">
              제품 이미지 (옵션)
            </label>
            <div className="w-full h-[300px] bg-[#FAFAFA] border border-[#D4D4D4] rounded-[12px] flex items-center justify-center overflow-hidden">
              {formData.mainImageUrl ? (
                <img
                  src={formData.mainImageUrl}
                  alt={formData.productName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[#A3A3A3]">이미지 없음</span>
              )}
            </div>
            <input
              type="text"
              value={formData.mainImageUrl}
              onChange={(e) =>
                setFormData({ ...formData, mainImageUrl: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="이미지 URL을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품명 (영문)
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="Product Name"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품명 (한글)
              </label>
              <input
                type="text"
                value={formData.productNameKo}
                onChange={(e) =>
                  setFormData({ ...formData, productNameKo: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="제품명"
              />
            </div>

            <div className="grid grid-cols-3 gap-[12px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[600] text-[#404040]">
                  대분류
                </label>
                <input
                  type="text"
                  value={formData.mainCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, mainCategory: e.target.value })
                  }
                  className="w-full px-[12px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                  placeholder="Chucks"
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[600] text-[#404040]">
                  중분류
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subCategory: e.target.value })
                  }
                  className="w-full px-[12px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                  placeholder="Standard Chucks"
                />
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[600] text-[#404040]">
                  시리즈
                </label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) =>
                    setFormData({ ...formData, series: e.target.value })
                  }
                  className="w-full px-[12px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                  placeholder="BR Series"
                />
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                Source URL (옵션)
              </label>
              <input
                type="text"
                value={formData.sourceUrl}
                onChange={(e) =>
                  setFormData({ ...formData, sourceUrl: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                PDF URL (옵션)
              </label>
              <input
                type="text"
                value={formData.pdfUrl}
                onChange={(e) =>
                  setFormData({ ...formData, pdfUrl: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="https://example.com/file.pdf"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                YouTube URL (옵션)
              </label>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeUrl: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-[24px]">
          <div className="flex items-center gap-[12px]">
            <label className="flex items-center gap-[8px] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-[16px] h-[16px]"
              />
              <span className="text-[14px] text-[#404040]">활성화</span>
            </label>
            <label className="flex items-center gap-[8px] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-[16px] h-[16px]"
              />
              <span className="text-[14px] text-[#404040]">추천 제품</span>
            </label>
          </div>
          <div className="flex gap-[12px]">
            <button
              onClick={handleSubmit}
              className="px-[32px] py-[12px] bg-[#0089D1] text-white rounded-[8px] text-[14px] font-[600] hover:bg-[#0077B8]"
            >
              {isCreateMode ? "제품 추가하기" : "제품 수정 완료하기"}
            </button>
            {!isCreateMode && (
              <button className="px-[32px] py-[12px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]">
                제품 삭제하기
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
                {formData.productName}
              </h2>
              <span className="text-[16px] font-[500] text-[#2B7FFF]">
                하위 제품분류 설정페이지
              </span>
            </div>

            <div className="flex gap-[12px]">
              {["4축 회전/분할", "4축 고정형", "5축 NC분할", "인텍방식"].map((tab) => (
                <button
                  key={tab}
                  className={`px-[24px] py-[12px] rounded-[8px] text-[14px] font-[600] ${
                    tab === "4축 회전/분할"
                      ? "bg-[#0089D1] text-white"
                      : "bg-white border border-[#D4D4D4] text-[#404040] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-[16px]">
              <h3 className="text-[20px] font-[700] text-[#404040]">
                하위 제품 설정
                <span className="text-[16px] font-[500] text-[#0089D1] ml-[12px]">
                  최소 3개의 제품을 설정해주세요
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {mockSubProducts.map((product) => {
                  const isSelected = selectedSubProducts.includes(product.name);
                  return (
                    <div
                      key={product.name}
                      onClick={() => handleSubProductClick(product.name)}
                      className={`flex flex-col w-full border-[1px] rounded-[12px] p-[20px] cursor-pointer duration-300 ${
                        isSelected
                          ? "border-[#0089D1] bg-[#E6F3FA]"
                          : "border-[#D4D4D4] bg-[#FAFAFA] hover:border-[#0089D1] hover:bg-[#E6F3FA]"
                      }`}
                    >
                      <h4 className="text-[18px] font-[700] text-[#404040] mb-[12px]">
                        {product.name}
                      </h4>
                      <p className="text-[12px] font-[500] text-[#0089D1] mb-[16px]">
                        Compact & high accuracy Combination with chuck is available.
                      </p>
                      <div className="flex-1 flex items-center justify-center mb-[16px]">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-[140px] object-contain"
                        />
                      </div>
                      <Link
                        href="#"
                        onClick={(e) => e.stopPropagation()}
                        className="self-end text-[#0089D1] text-[14px] font-[600] hover:underline flex items-center gap-[4px]"
                      >
                        제품 수정하기
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
