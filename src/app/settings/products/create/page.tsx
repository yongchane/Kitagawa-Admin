"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  productsAPI,
  ProductCreateRequest,
  Category,
  Level2SubCategory,
} from "@/api/products";
import SingleImageSlot from "../setting/components/SingleImageSlot";
import Switch from "../../components/Switch";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import SubmitButton from "../components/SubmitButton";
import AlertMessage from "../components/AlertMessage";
import PageHeader from "../components/PageHeader";

// 토글 가능한 선택 필드 키
type OptionalField =
  | "productNameKo"
  | "series"
  | "mainImage"
  | "description"
  | "content"
  | "contentDetail"
  | "specificationHtml"
  | "pdfUrl"
  | "youtubeUrl";

const OPTIONAL_FIELDS: {
  key: OptionalField;
  label: string;
}[] = [
  { key: "productNameKo", label: "제품명 (한글)" },
  { key: "series", label: "시리즈명" },
  { key: "mainImage", label: "대표 이미지" },
  { key: "description", label: "제품 특징" },
  { key: "content", label: "제품 소개" },
  { key: "contentDetail", label: "제품 상세" },
  { key: "specificationHtml", label: "사양표 (HTML)" },
  { key: "pdfUrl", label: "PDF 카탈로그 URL" },
  { key: "youtubeUrl", label: "유튜브 URL" },
];

export default function ProductCreatePage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 카테고리 데이터
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2SubCategories, setLevel2SubCategories] = useState<
    Level2SubCategory[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingLevel2, setIsLoadingLevel2] = useState(false);

  // 활성화된 선택 필드 토글
  const [enabledFields, setEnabledFields] = useState<Set<OptionalField>>(
    new Set()
  );

  // HTML 미리보기 상태
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    productName: "",
    productNameKo: "",
    mainCategory: "",
    subCategory: "",
    series: "",
    mainImageUrl: "",
    description: "",
    content: "",
    contentDetail: "",
    specificationHtml: "",
    pdfUrl: "",
    youtubeUrl: "",
    isActive: true,
  });

  // 필드 토글
  const toggleField = (field: OptionalField) => {
    setEnabledFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  // Level 1 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productsAPI.getLevel1Categories();
        if (response.success && response.data?.items) {
          setLevel1Categories(response.data.items);
        }
      } catch (err: any) {
        console.error("Failed to load categories:", err);
        setError("카테고리 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Level 2 카테고리 로드 (mainCategory 변경 시)
  useEffect(() => {
    const loadLevel2 = async () => {
      if (!formData.mainCategory) {
        setLevel2SubCategories([]);
        return;
      }

      setIsLoadingLevel2(true);
      try {
        const response = await productsAPI.getLevel2Categories(
          formData.mainCategory
        );
        if (response.success && response.data?.subCategories) {
          setLevel2SubCategories(
            response.data.subCategories.sort((a, b) => a.order - b.order)
          );
        }
      } catch (err: any) {
        console.error("Failed to load level 2 categories:", err);
      } finally {
        setIsLoadingLevel2(false);
      }
    };
    loadLevel2();
  }, [formData.mainCategory]);

  // slug 자동 생성 (productName 기반)
  const handleProductNameChange = (value: string) => {
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    setFormData({
      ...formData,
      productName: value,
      slug: autoSlug,
    });
  };

  // 제출 가능 조건
  const isSubmitDisabled = useMemo(() => {
    return (
      !formData.slug.trim() ||
      !formData.productName.trim() ||
      !formData.mainCategory ||
      !formData.subCategory ||
      isSubmitting
    );
  }, [
    formData.slug,
    formData.productName,
    formData.mainCategory,
    formData.subCategory,
    isSubmitting,
  ]);

  // 선택된 카테고리의 이름 찾기
  const getMainCategoryName = () => {
    const cat = level1Categories.find((c) => c.slug === formData.mainCategory);
    return cat?.name || "";
  };

  const getSubCategoryName = () => {
    const cat = level2SubCategories.find(
      (c) => c.slug === formData.subCategory
    );
    return cat?.name || "";
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const requestData: ProductCreateRequest = {
        slug: formData.slug,
        productName: formData.productName,
        productNameKo:
          enabledFields.has("productNameKo") && formData.productNameKo
            ? formData.productNameKo
            : formData.productName,
        category: {
          mainCategory: getMainCategoryName(),
          subCategory: getSubCategoryName(),
          series:
            enabledFields.has("series") && formData.series
              ? formData.series
              : getSubCategoryName(),
        },
        isActive: formData.isActive,
      };

      // 토글이 켜져 있는 선택 필드만 포함
      if (enabledFields.has("mainImage") && formData.mainImageUrl) {
        requestData.mainImageUrl = formData.mainImageUrl;
      }
      if (enabledFields.has("description") && formData.description) {
        requestData.description = formData.description;
      }
      if (enabledFields.has("content") && formData.content) {
        requestData.content = formData.content;
      }
      if (enabledFields.has("contentDetail") && formData.contentDetail) {
        requestData.contentDetail = formData.contentDetail;
      }
      if (
        enabledFields.has("specificationHtml") &&
        formData.specificationHtml
      ) {
        requestData.specificationHtml = formData.specificationHtml;
      }
      if (enabledFields.has("pdfUrl") && formData.pdfUrl) {
        requestData.pdfUrl = formData.pdfUrl;
      }
      if (enabledFields.has("youtubeUrl") && formData.youtubeUrl) {
        requestData.youtubeUrl = formData.youtubeUrl;
      }

      const response = await productsAPI.createProduct(requestData);

      if (response.success) {
        setSuccessMessage("제품이 성공적으로 등록되었습니다.");
        setTimeout(() => {
          router.push(
            `/settings/products/setting?slug=${formData.mainCategory}`
          );
        }, 2000);
      } else {
        setError(response.message || "제품 등록에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.message || "요청 처리 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-[#737373]">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[32px] pretendard p-[40px] max-w-[960px] bg-white text-[#171717] min-h-screen">
      {error && <AlertMessage type="error" message={error} />}
      {successMessage && (
        <AlertMessage type="success" message={successMessage} />
      )}

      <section className="w-full flex flex-col gap-[24px]">
        <PageHeader
          title="새 제품 등록"
          subtitle="직접 제품 정보를 입력하여 등록합니다"
          titleColor="#004B73"
        />

        {/* === 필수 영역 === */}
        <div className="flex flex-col gap-[20px] p-[24px] bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB]">
          <h3 className="text-[16px] font-[700] text-[#404040]">
            필수 정보
          </h3>

          <div className="grid grid-cols-2 gap-[16px]">
            {/* 대분류 카테고리 선택 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-[600] text-[#404040]">
                대분류 카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mainCategory}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mainCategory: e.target.value,
                    subCategory: "",
                  })
                }
                className="w-full px-[14px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[14px] text-[#171717] focus:outline-none focus:border-[#0089D1] bg-white"
              >
                <option value="">대분류를 선택하세요</option>
                {level1Categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 중분류 카테고리 선택 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-[600] text-[#404040]">
                중분류 카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subCategory}
                onChange={(e) =>
                  setFormData({ ...formData, subCategory: e.target.value })
                }
                disabled={!formData.mainCategory || isLoadingLevel2}
                className="w-full px-[14px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[14px] text-[#171717] focus:outline-none focus:border-[#0089D1] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingLevel2
                    ? "불러오는 중..."
                    : "중분류를 선택하세요"}
                </option>
                {level2SubCategories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            label="제품명 (영문) *"
            value={formData.productName}
            onChange={handleProductNameChange}
            placeholder="예: CK160N"
          />

          <FormInput
            label="Slug (URL 경로)"
            value={formData.slug}
            onChange={(value) => setFormData({ ...formData, slug: value })}
            placeholder="자동 생성됩니다 (직접 수정 가능)"
          />
        </div>

        <hr className="border-t border-[#E5E7EB]" />

        {/* === 선택 항목 토글 === */}
        <div className="flex flex-col gap-[16px]">
          <h3 className="text-[16px] font-[700] text-[#404040]">
            선택 항목
            <span className="text-[13px] font-[400] text-[#737373] ml-[8px]">
              필요한 항목만 켜서 입력하세요
            </span>
          </h3>

          <div className="flex flex-wrap gap-[8px]">
            {OPTIONAL_FIELDS.map((field) => {
              const isOn = enabledFields.has(field.key);
              return (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => toggleField(field.key)}
                  className={`px-[14px] py-[8px] rounded-[20px] text-[13px] font-[600] border transition-all duration-200 ${
                    isOn
                      ? "bg-[#0089D1] text-white border-[#0089D1]"
                      : "bg-white text-[#737373] border-[#D4D4D4] hover:border-[#0089D1] hover:text-[#0089D1]"
                  }`}
                >
                  {isOn ? "- " : "+ "}
                  {field.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* === 활성화된 선택 필드 입력 영역 === */}
        {enabledFields.size > 0 && (
          <div className="flex flex-col gap-[20px] p-[24px] bg-white rounded-[12px] border border-[#E5E7EB]">
            {/* 제품명 (한글) */}
            {enabledFields.has("productNameKo") && (
              <FormInput
                label="제품명 (한글)"
                value={formData.productNameKo}
                onChange={(value) =>
                  setFormData({ ...formData, productNameKo: value })
                }
                placeholder="예: 퀸테 컨트롤러"
              />
            )}

            {/* 시리즈명 */}
            {enabledFields.has("series") && (
              <FormInput
                label="시리즈명"
                value={formData.series}
                onChange={(value) =>
                  setFormData({ ...formData, series: value })
                }
                placeholder="미입력 시 중분류명이 사용됩니다"
              />
            )}

            {/* 대표 이미지 */}
            {enabledFields.has("mainImage") && (
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] font-[600] text-[#404040]">
                  대표 이미지
                </label>
                <SingleImageSlot
                  imageUrl={formData.mainImageUrl}
                  onImageUpdate={(newImageUrl) =>
                    setFormData({ ...formData, mainImageUrl: newImageUrl })
                  }
                  altText={formData.productName || "제품 이미지"}
                />
              </div>
            )}

            {/* 제품 특징 (description) */}
            {enabledFields.has("description") && (
              <FormTextarea
                label="제품 특징"
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="제품 특징을 입력하세요 (줄바꿈으로 항목 구분)"
                height="100px"
              />
            )}

            {/* 제품 소개 (content) */}
            {enabledFields.has("content") && (
              <FormTextarea
                label="제품 소개"
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                placeholder="제품에 대한 짧은 소개 텍스트"
                height="80px"
              />
            )}

            {/* 제품 상세 (contentDetail) */}
            {enabledFields.has("contentDetail") && (
              <FormTextarea
                label="제품 상세 설명"
                value={formData.contentDetail}
                onChange={(value) =>
                  setFormData({ ...formData, contentDetail: value })
                }
                placeholder="제품 상세 설명 (캐치프레이즈 등)"
                height="80px"
              />
            )}

            {/* 사양표 HTML */}
            {enabledFields.has("specificationHtml") && (
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-[600] text-[#404040]">
                    사양표 (HTML)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                    className={`px-[12px] py-[4px] rounded-[6px] text-[12px] font-[600] border transition-colors ${
                      showHtmlPreview
                        ? "bg-[#0089D1] text-white border-[#0089D1]"
                        : "bg-white text-[#0089D1] border-[#0089D1] hover:bg-[#E6F3FA]"
                    }`}
                  >
                    {showHtmlPreview ? "편집 모드" : "미리보기"}
                  </button>
                </div>

                {!showHtmlPreview ? (
                  <textarea
                    value={formData.specificationHtml}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specificationHtml: e.target.value,
                      })
                    }
                    placeholder={`HTML 테이블을 붙여넣으세요.\n\n예시:\n<table>\n  <thead>\n    <tr><th>모델</th><th>사이즈</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>CK160N</td><td>160mm</td></tr>\n  </tbody>\n</table>`}
                    className="w-full h-[200px] px-[14px] py-[10px] border border-[#D4D4D4] rounded-[8px] text-[13px] font-mono focus:outline-none focus:border-[#0089D1] resize-y bg-[#1E1E1E] text-[#D4D4D4]"
                    spellCheck={false}
                  />
                ) : (
                  <div className="w-full min-h-[200px] px-[14px] py-[10px] border border-[#D4D4D4] rounded-[8px] bg-white overflow-auto">
                    {formData.specificationHtml ? (
                      <div
                        className="spec-table-preview"
                        dangerouslySetInnerHTML={{
                          __html: formData.specificationHtml,
                        }}
                      />
                    ) : (
                      <p className="text-[14px] text-[#A3A3A3]">
                        HTML을 입력하면 미리보기가 표시됩니다
                      </p>
                    )}
                  </div>
                )}
                <p className="text-[12px] text-[#A3A3A3]">
                  일본 기타가와 사이트 등에서 사양표 HTML을 복사하여
                  붙여넣을 수 있습니다
                </p>
              </div>
            )}

            {/* PDF 카탈로그 URL */}
            {enabledFields.has("pdfUrl") && (
              <FormInput
                label="PDF 카탈로그 URL"
                value={formData.pdfUrl}
                onChange={(value) =>
                  setFormData({ ...formData, pdfUrl: value })
                }
                placeholder="https://..."
              />
            )}

            {/* 유튜브 URL */}
            {enabledFields.has("youtubeUrl") && (
              <FormInput
                label="유튜브 URL"
                value={formData.youtubeUrl}
                onChange={(value) =>
                  setFormData({ ...formData, youtubeUrl: value })
                }
                placeholder="https://youtube.com/..."
              />
            )}
          </div>
        )}

        <hr className="border-t border-[#E5E7EB]" />

        {/* === 하단 영역 === */}
        <div className="flex justify-between items-center">
          <Switch
            label="제품 노출"
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />

          <div className="flex gap-[12px]">
            <button
              onClick={() => router.back()}
              className="px-[32px] py-[12px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]"
            >
              취소
            </button>
            <SubmitButton onClick={handleSubmit} disabled={isSubmitDisabled}>
              {isSubmitting ? "등록 중..." : "제품 등록하기"}
            </SubmitButton>
          </div>
        </div>
      </section>

      {/* 사양표 미리보기용 기본 스타일 */}
      <style jsx global>{`
        .spec-table-preview table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .spec-table-preview th,
        .spec-table-preview td {
          border: 1px solid #d4d4d4;
          padding: 8px 12px;
          text-align: left;
        }
        .spec-table-preview th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .spec-table-preview tr:nth-child(even) {
          background-color: #fafafa;
        }
      `}</style>
    </div>
  );
}
