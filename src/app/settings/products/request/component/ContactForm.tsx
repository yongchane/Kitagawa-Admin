"use client";

import { useState, useEffect } from "react";
import { requestAPI } from "@/api/request";
import { productsAPI, Category, Level2SubCategory } from "@/api/products";
import { useSubmit } from "@/contexts/ReaquestContext";

interface FormData {
  productName: string;
  seriesName: string;
  seriesCustom: string;
  url: string;
  autoImport: boolean;
  requestDetails: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    seriesName: "",
    seriesCustom: "",
    url: "",
    autoImport: false,
    requestDetails: "",
  });
  const { submitSuccess, setSubmitSuccess } = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 카테고리 데이터
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [allSeries, setAllSeries] = useState<
    { name: string; parentName: string }[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [useCustomSeries, setUseCustomSeries] = useState(false);

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productsAPI.getLevel1Categories();
        if (response.success && response.data?.items) {
          setLevel1Categories(response.data.items);

          // 모든 Level 1 카테고리에서 Level 2 서브카테고리 가져오기
          const seriesList: { name: string; parentName: string }[] = [];
          for (const cat of response.data.items) {
            try {
              const level2Response = await productsAPI.getLevel2Categories(
                cat.slug
              );
              if (level2Response.success && level2Response.data?.subCategories) {
                for (const sub of level2Response.data.subCategories) {
                  seriesList.push({
                    name: sub.name,
                    parentName: cat.name,
                  });
                }
              }
            } catch {
              // 개별 카테고리 로드 실패는 무시
            }
          }
          setAllSeries(seriesList);
        }
      } catch (err: any) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const seriesName = useCustomSeries
      ? formData.seriesCustom
      : formData.seriesName;

    if (!formData.productName || !seriesName) {
      alert("제품명과 시리즈명은 필수 항목입니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestAPI.submitProductRequest({
        productName: formData.productName,
        seriesName: seriesName,
        url: formData.url || undefined,
        requestDetails: formData.requestDetails,
        autoImport: formData.autoImport && !!formData.url,
      });

      if (response.success) {
        setSubmitSuccess(true);
        setFormData({
          productName: "",
          seriesName: "",
          seriesCustom: "",
          url: "",
          autoImport: false,
          requestDetails: "",
        });
        setUseCustomSeries(false);
      } else {
        alert(response.message || "문의 제출에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "문의 제출 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const seriesName = useCustomSeries
    ? formData.seriesCustom
    : formData.seriesName;
  const isFormValid = formData.productName && seriesName;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[36px]">
      <h2 className="w-full border-b-[1px] text-[#0089D1] text-[20px] font-[600]">
        새로운 제품 추가시 다음 양식을 채워주세요
      </h2>

      <div className="flex flex-col gap-[24px]">
        {/* 제품명 (필수) */}
        <div>
          <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
            <span>제품명</span>
            <p className="text-[#FB2C36] text-[14px] font-[500]">(필수)</p>
          </div>
          <input
            name="productName"
            value={formData.productName}
            onChange={handleInputChange}
            type="text"
            placeholder="제품명을 입력해주세요"
            className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
          />
        </div>

        {/* 시리즈명 (필수 - 드롭다운 or 직접 입력) */}
        <div>
          <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
            <span>시리즈명</span>
            <p className="text-[#FB2C36] text-[14px] font-[500]">(필수)</p>
          </div>

          {!useCustomSeries ? (
            <div className="flex flex-col gap-[8px]">
              <select
                value={formData.seriesName}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setUseCustomSeries(true);
                    setFormData((prev) => ({ ...prev, seriesName: "" }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      seriesName: e.target.value,
                    }));
                  }
                }}
                disabled={isLoadingCategories}
                className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1] bg-white disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingCategories
                    ? "카테고리 불러오는 중..."
                    : "시리즈를 선택하세요"}
                </option>
                {/* 카테고리별 그룹핑 */}
                {level1Categories.map((cat) => {
                  const children = allSeries.filter(
                    (s) => s.parentName === cat.name
                  );
                  if (children.length === 0) return null;
                  return (
                    <optgroup key={cat.slug} label={cat.name}>
                      {children.map((series) => (
                        <option key={series.name} value={series.name}>
                          {series.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
                <option value="__custom__">
                  직접 입력...
                </option>
              </select>
            </div>
          ) : (
            <div className="flex gap-[8px]">
              <input
                name="seriesCustom"
                value={formData.seriesCustom}
                onChange={handleInputChange}
                type="text"
                placeholder="시리즈명을 직접 입력해주세요"
                className="flex-1 px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
              />
              <button
                type="button"
                onClick={() => {
                  setUseCustomSeries(false);
                  setFormData((prev) => ({
                    ...prev,
                    seriesCustom: "",
                  }));
                }}
                className="px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] text-[#737373] hover:bg-[#F5F5F5]"
              >
                목록에서 선택
              </button>
            </div>
          )}
        </div>

        {/* URL (선택) + 자동 크롤링 체크 */}
        <div>
          <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
            <span>URL</span>
            <p className="text-[#737373] text-[14px] font-[500]">(선택)</p>
          </div>
          <input
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            type="text"
            placeholder="일본 기타가와에서 제품 URL을 입력해주세요"
            className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
          />
          {/* URL이 입력되면 자동 크롤링 체크박스 표시 */}
          {formData.url && (
            <label className="flex items-center gap-[8px] mt-[12px] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoImport}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoImport: e.target.checked,
                  }))
                }
                className="w-[18px] h-[18px] accent-[#0089D1]"
              />
              <span className="text-[14px] text-[#404040] font-[500]">
                이 URL에서 자동으로 제품 데이터를 크롤링하여 추가합니다
              </span>
            </label>
          )}
        </div>
      </div>

      <h2 className="w-full border-b-[1px] text-[#0089D1] text-[20px] font-[600]">
        요청사항이 있다면 다음 양식을 채워주세요
      </h2>

      <div>
        <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
          <span>요청사항</span>
          <p className="text-[#737373] text-[14px] font-[500]">(선택)</p>
        </div>
        <textarea
          name="requestDetails"
          value={formData.requestDetails}
          onChange={handleInputChange}
          placeholder="요청사항을 입력해주세요"
          className="w-full h-[130px] mb-[4px] px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
        />
        <span className="flex justify-end text-[#737373] text-[12px] font-[500]">
          {formData.requestDetails.length} / 1000
        </span>
      </div>

      <div className="flex flex-col justify-end items-end gap-[13px] mt-[20px]">
        {!isFormValid && (
          <div className="flex items-center justify-end text-[#FB2C36] text-[14px] font-[600]">
            <img
              src="/error.svg"
              alt="error"
              className="inline-block mr-[4px]"
            />
            <span>제품명과 시리즈명은 필수 항목입니다.</span>
          </div>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting || submitSuccess}
          className={`w-[272px] h-[40px] px-[16px] py-[8px] text-white rounded-[9999px] ${
            isFormValid && !isSubmitting && !submitSuccess
              ? "bg-[#0089D1]"
              : "bg-[#EEEEEE]"
          }`}
        >
          {isSubmitting
            ? "제출 중..."
            : submitSuccess
            ? "제출 완료"
            : "문의하기"}
        </button>
      </div>
    </form>
  );
}
