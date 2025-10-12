"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
  const productName = searchParams?.get("product") || "NC Rotary table";

  const [formData, setFormData] = useState({
    name: productName,
    description: "Compact & high accuracy Combination with chuck is available.",
    image: "https://www.kitagawa.com/en/mtools/item/MK200R_right.jpg",
    catalogFile: null as File | null,
  });

  const [selectedSubProducts, setSelectedSubProducts] = useState<string[]>([]);

  const handleSubProductClick = (productName: string) => {
    if (selectedSubProducts.includes(productName)) {
      setSelectedSubProducts(selectedSubProducts.filter((p) => p !== productName));
    } else {
      setSelectedSubProducts([...selectedSubProducts, productName]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[40px] pretendard p-[40px]">
      <section className="w-full flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h2 className="text-[24px] font-[700] text-[#171717]">{productName}</h2>
          <span className="text-[14px] font-[500] text-[#737373]">
            수정페이지 입니다.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[40px]">
          <div className="flex flex-col gap-[12px]">
            <label className="text-[16px] font-[600] text-[#404040]">
              제품 이미지 (옵션)
            </label>
            <div className="w-full h-[300px] bg-[#FAFAFA] border border-[#D4D4D4] rounded-[12px] flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[#A3A3A3]">이미지 없음</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품명 (옵션)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
                placeholder="NC Rotary table"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품 설명 (옵션)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] h-[120px] resize-none focus:outline-none focus:border-[#0089D1]"
                placeholder="Compact & high accuracy Combination with chuck is available."
              />
              <div className="text-right text-[12px] text-[#A3A3A3]">20/200</div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                중간 카테고리 설정 (옵션)
              </label>
              <div className="flex flex-col gap-[8px] px-[16px] py-[12px] bg-[#F5F5F5] rounded-[8px]">
                <div className="text-[14px] text-[#0089D1] mb-[8px]">
                  바라차 순서를 드래그 해서 설정해보세요
                </div>
                <div className="flex flex-col gap-[4px]">
                  {["4축 회전/분할", "4축 고정형", "5축 NC분할", "인텍방식"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-[8px] px-[12px] py-[8px] bg-white border border-[#D4D4D4] rounded-[6px] cursor-move"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2 4h12M2 8h12M2 12h12"
                          stroke="#737373"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-[14px] text-[#404040]">{item}</span>
                    </div>
                  ))}
                </div>
                <button className="text-[14px] text-[#0089D1] font-[600] self-start mt-[8px]">
                  + 카테고리 추가하기
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[16px] font-[600] text-[#404040]">
                제품 자료 업로드 (옵션)
              </label>
              <button className="self-start px-[24px] py-[12px] bg-[#0089D1] text-white rounded-[8px] text-[14px] font-[600] hover:bg-[#0077B8] flex items-center gap-[8px]">
                PDF 파일선택 (2)
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-[24px]">
          <input
            type="text"
            placeholder="NC Rotary table의 제품분류를 터 쳐주세요 검색하세요"
            className="flex-1 max-w-[400px] px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
          />
          <div className="flex gap-[12px]">
            <button className="px-[32px] py-[12px] bg-[#0089D1] text-white rounded-[8px] text-[14px] font-[600] hover:bg-[#0077B8]">
              제품 수정 완료하기
            </button>
            <button className="px-[32px] py-[12px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]">
              제품 삭제하기
            </button>
          </div>
        </div>
      </section>

      <hr className="border-t border-[#D4D4D4]" />

      <section className="w-full flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h2 className="text-[24px] font-[700] text-[#171717]">{productName}</h2>
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
