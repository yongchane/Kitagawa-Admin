"use client";

import { useRef, useState } from "react";
import { homeSettingsAPI } from "@/api/homeSettings";

interface SingleImageSlotProps {
  imageUrl: string;
  onImageUpdate: (newImageUrl: string) => void;
  altText?: string;
}

export default function SingleImageSlot({
  imageUrl,
  onImageUpdate,
  altText = "제품 이미지",
}: SingleImageSlotProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // CDN에 이미지 업로드 (category 폴더 사용)
      const uploadResponse = await homeSettingsAPI.uploadFile(file, "category");

      if (uploadResponse.success && uploadResponse.data?.url) {
        const newImageUrl = uploadResponse.data.url;
        setCurrentImageUrl(newImageUrl);
        onImageUpdate(newImageUrl);
      } else {
        setUploadError(
          uploadResponse.message || "이미지 업로드에 실패했습니다."
        );
      }
    } catch (error: any) {
      console.error("Image upload error:", error);
      setUploadError(
        error.response?.data?.message || "이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // input 초기화
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <label className="text-[16px] font-[600] text-[#404040]">
        제품 이미지 (옵션)
      </label>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{uploadError}</p>
        </div>
      )}

      <div
        className="relative w-full h-[300px] bg-[#FAFAFA] border border-[#D4D4D4] rounded-[12px] flex items-center justify-center overflow-hidden group cursor-pointer"
        onClick={() => {
          if (!isUploading) {
            fileInputRef.current?.click();
          }
        }}
      >
        {currentImageUrl ? (
          <>
            <img
              src={currentImageUrl}
              alt={altText}
              className="w-full h-full object-contain"
            />
            {/* Hover 시 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity flex flex-col items-center justify-center">
              {/* 중앙 이미지 수정하기 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={isUploading}
                className="bg-[rgba(238, 238, 238, 0.40)] bg-opacity-20 hover:bg-opacity-40 transition-all rounded-full w-20 h-20 flex flex-col items-center justify-center gap-1 text-white disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="text-[10px] font-[400]">업로드 중...</span>
                ) : (
                  <>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="text-[10px] font-[400] whitespace-nowrap">
                      이미지 수정하기
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <span className="text-[#A3A3A3]">이미지 없음</span>
        )}

        {/* 숨겨진 파일 인풋 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      <input
        type="text"
        value={currentImageUrl}
        onChange={(e) => {
          setCurrentImageUrl(e.target.value);
          onImageUpdate(e.target.value);
        }}
        className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
        placeholder="이미지 URL을 입력하세요"
      />
    </div>
  );
}
