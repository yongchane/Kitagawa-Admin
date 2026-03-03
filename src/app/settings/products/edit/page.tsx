"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { productsAPI, ProductDetail } from "@/api/products";
import SingleImageSlot from "../setting/components/SingleImageSlot";
import Switch from "../../components/Switch";
import FormInput from "../components/FormInput";
import FormTextarea from "../components/FormTextarea";
import SubmitButton from "../components/SubmitButton";
import AlertMessage from "../components/AlertMessage";
import PageHeader from "../components/PageHeader";

function ProductEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams?.get("slug");

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 초기 로드된 제품명을 저장 (페이지 타이틀용)
  const [initialProductTitle, setInitialProductTitle] = useState("");

  const [formData, setFormData] = useState({
    productTitle: "",
    mainImageUrl: "",
    description: "",
    isActive: true,
    // 자동으로 전달할 필드들
    productName: "",
    content: "",
    contentDetail: "",
  });

  // 제출 버튼 활성화 조건: 이미지, 제품명, 설명이 모두 있어야 함
  const isSubmitDisabled = useMemo(() => {
    return (
      !formData.mainImageUrl.trim() ||
      !formData.productTitle.trim() ||
      !formData.description.trim()
    );
  }, [formData.mainImageUrl, formData.productTitle, formData.description]);

  // 제품 데이터 로드
  useEffect(() => {
    const loadProductData = async () => {
      if (!slug) {
        setError("제품 slug가 없습니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await productsAPI.getProductBySlug(slug);

        if (response.success && response.data) {
          const product = response.data;
          const productTitle = product.productTitle || product.productName;

          setFormData({
            productTitle,
            mainImageUrl: product.mainImageUrl,
            description: product.description,
            isActive: product.isActive,
            productName: product.productName,
            content: product.content || "",
            contentDetail: product.contentDetail || "",
          });

          // 초기 제품명 저장 (페이지 타이틀용)
          setInitialProductTitle(productTitle);
        } else {
          setError("제품 데이터를 불러올 수 없습니다.");
        }
      } catch (err: any) {
        console.error("Failed to load product data:", err);
        setError(
          err.response?.data?.message ||
            "제품 데이터를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [slug]);

  const handleDelete = async () => {
    if (!slug) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await productsAPI.deleteProduct(slug);

      if (response.success) {
        setSuccessMessage("제품이 삭제되었습니다.");
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setError(response.message || "제품 삭제에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(
        err.response?.data?.message || "제품 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      if (!slug) {
        setError("제품 slug가 없습니다.");
        return;
      }

      // Level 3 제품 정보 수정
      const requestData = {
        productTitle: formData.productTitle,
        productName: formData.productName,
        mainImageUrl: formData.mainImageUrl,
        description: formData.description,
        content: formData.content,
        contentDetail: formData.contentDetail,
        isActive: formData.isActive,
      };

      const response = await productsAPI.updateLevel3Product(slug, requestData);

      if (response.success) {
        setSuccessMessage("제품이 성공적으로 수정되었습니다.");

        // 데이터 새로고침
        const refreshResponse = await productsAPI.getProductBySlug(slug);
        if (refreshResponse.success && refreshResponse.data) {
          const product = refreshResponse.data;
          const productTitle = product.productTitle || product.productName;

          setFormData({
            productTitle,
            mainImageUrl: product.mainImageUrl,
            description: product.description,
            isActive: product.isActive,
            productName: product.productName,
            content: product.content || "",
            contentDetail: product.contentDetail || "",
          });

          // 페이지 타이틀 업데이트
          setInitialProductTitle(productTitle);
        }
      } else {
        setError(response.message || "제품 수정에 실패했습니다.");
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
      {error && <AlertMessage type="error" message={error} />}
      {successMessage && (
        <AlertMessage type="success" message={successMessage} />
      )}

      <section className="w-full flex flex-col gap-[24px]">
        <PageHeader
          title={initialProductTitle || "제품 수정"}
          subtitle="수정 페이지입니다"
          titleColor="#004B73"
        />

        <div className="grid grid-cols-2 gap-[40px]">
          <SingleImageSlot
            imageUrl={formData.mainImageUrl}
            onImageUpdate={(newImageUrl) =>
              setFormData({ ...formData, mainImageUrl: newImageUrl })
            }
            altText={formData.productTitle}
          />

          <div className="flex flex-col gap-[20px]">
            <FormInput
              label="제품명 (영문)"
              value={formData.productName}
              onChange={(value) =>
                setFormData({ ...formData, productName: value })
              }
              placeholder="Product Name"
            />

            <FormTextarea
              label="제품 설명"
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Product Description"
            />
          </div>
          <Switch
            label="제품 노출"
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
        </div>

        <div className="flex justify-between items-center mt-[24px]">
          <div className="flex gap-[12px]">
            <SubmitButton onClick={handleSubmit} disabled={isSubmitDisabled}>
              제품 수정 완료하기
            </SubmitButton>
            <button
              onClick={() => router.back()}
              className="px-[32px] py-[12px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]"
            >
              취소
            </button>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-[32px] py-[12px] bg-white border border-red-300 text-red-500 rounded-[8px] text-[14px] font-[600] hover:bg-red-50"
          >
            제품 삭제
          </button>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[12px] p-[32px] max-w-[400px] w-full mx-[16px]">
              <h3 className="text-[18px] font-[700] text-[#404040] mb-[12px]">
                제품 삭제
              </h3>
              <p className="text-[14px] text-[#737373] mb-[24px]">
                &quot;{initialProductTitle}&quot; 제품을 삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-[12px] justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-[24px] py-[10px] bg-white border border-[#D4D4D4] text-[#404040] rounded-[8px] text-[14px] font-[600] hover:bg-[#F5F5F5]"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-[24px] py-[10px] bg-red-500 text-white rounded-[8px] text-[14px] font-[600] hover:bg-red-600 disabled:bg-red-300"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProductEditContent />
    </Suspense>
  );
}
