"use client";

import { useState, useRef } from "react";
import { uploadFileToGCP } from "@/utils/fileUpload";
import Image from "next/image";

export interface ProductFormData {
  slug: string;
  productName: string;
  mainCategory: string;
  subCategory: string;
  sourceUrl: string;
  mainImageUrl: string;
  pdfUrl: string;
}

interface ProductDetailFormProps {
  initialData?: Partial<ProductFormData>;
  categoryName: string;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductDetailForm({
  initialData,
  categoryName,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductDetailFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    slug: initialData?.slug || "",
    productName: initialData?.productName || "",
    mainCategory: initialData?.mainCategory || "",
    subCategory: initialData?.subCategory || categoryName,
    sourceUrl: initialData?.sourceUrl || "",
    mainImageUrl: initialData?.mainImageUrl || "",
    pdfUrl: initialData?.pdfUrl || "",
  });

  const [uploading, setUploading] = useState<{
    image: boolean;
    pdf: boolean;
  }>({
    image: false,
    pdf: false,
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, image: true }));
    try {
      const response = await uploadFileToGCP(file, "product");
      if (response.success && response.data) {
        setFormData((prev) => ({ ...prev, sourceUrl: response.data!.url }));
      } else {
        alert(response.message || "이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading((prev) => ({ ...prev, image: false }));
    }
  };

  // PDF 업로드 핸들러
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    setUploading((prev) => ({ ...prev, pdf: true }));
    try {
      const response = await uploadFileToGCP(file, "resource");
      if (response.success && response.data) {
        setFormData((prev) => ({ ...prev, pdfUrl: response.data!.url }));
      } else {
        alert(response.message || "PDF 업로드에 실패했습니다.");
      }
    } catch (error) {
      alert("PDF 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading((prev) => ({ ...prev, pdf: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.productName.trim()) {
      alert("제품명을 입력해주세요.");
      return;
    }
    if (!formData.mainCategory.trim()) {
      alert("제품명(영문)을 입력해주세요.");
      return;
    }
    if (!formData.sourceUrl) {
      alert("제품 이미지를 업로드해주세요.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">
        {initialData?.productName || "새 제품 추가"}
      </h2>

      {/* 제품명 (한글) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제품명 <span className="text-red-500">(필수)</span>
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, productName: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="제품명을 입력해 주세요"
        />
      </div>

      {/* 제품명 (영문) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제품명(영문) <span className="text-red-500">(필수)</span>
        </label>
        <input
          type="text"
          value={formData.mainCategory}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, mainCategory: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Product Name"
        />
      </div>

      {/* 중간 카테고리 (읽기 전용) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          중간 카테고리 <span className="text-red-500">(필수)</span>
        </label>
        <input
          type="text"
          value={formData.subCategory}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      {/* 제품 이미지 업로드 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제품 이미지 <span className="text-red-500">(필수)</span>
        </label>
        <div className="flex items-center gap-4">
          {formData.sourceUrl && (
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
              <Image
                src={formData.sourceUrl}
                alt="제품 이미지"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading.image}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading.image ? "업로드 중..." : "이미지 업로드"}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* PDF 업로드 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제품 자료 업로드 <span className="text-red-500">(필수)</span>
        </label>
        <div className="flex items-center gap-4">
          {formData.pdfUrl && (
            <a
              href={formData.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              📄 업로드된 PDF 보기
            </a>
          )}
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={uploading.pdf}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <span>📎</span>
            {uploading.pdf ? "업로드 중..." : "PDF 업로드하기"}
          </button>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || uploading.image || uploading.pdf}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {isLoading ? "저장 중..." : "제품 수정 완료하기"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 font-medium"
        >
          제품 삭제하기
        </button>
      </div>
    </form>
  );
}
