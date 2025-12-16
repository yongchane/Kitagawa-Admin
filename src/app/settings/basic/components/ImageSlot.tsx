"use client";

import { useRef, useState } from "react";
import { homeSettingsAPI, MainImage } from "@/api/homeSettings";

interface ImageSlotProps {
  uploadedImages: MainImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<MainImage[]>>;
  maxImages?: number;
  onImageUpload?: (image: MainImage) => void;
  onImageDelete?: (imageUrl: string) => void;
  onImageUpdate?: (oldUrl: string, newImage: MainImage) => void;
  onRefresh?: () => Promise<void>; // 데이터 새로고침 콜백
}

const imageList = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

export default function ImageSlot({
  uploadedImages,
  setUploadedImages,
  maxImages = 5,
  onImageUpload,
  onImageDelete,
  onImageUpdate,
  onRefresh,
}: ImageSlotProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // 파일명에서 확장자를 제거하여 alt 텍스트로 사용
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      // 2단계 업로드: 파일 업로드 후 메인 이미지 정보 저장
      const response = await homeSettingsAPI.uploadMainImage(
        file,
        fileName, // alt (영문)
        fileName // altKo (한글 - 필요시 사용자에게 입력받도록 개선 가능)
      );

      if (response.success && response.data) {
        const newImage = response.data;
        onImageUpload?.(newImage);

        // 최신 데이터 다시 불러오기
        if (onRefresh) {
          await onRefresh();
        } else {
          setUploadedImages((prev) => [...prev, newImage]);
        }
      } else {
        setUploadError(response.message || "이미지 업로드에 실패했습니다.");
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
    if (file && uploadedImages.length < maxImages) {
      handleImageUpload(file);
    }
    // input 초기화
    e.target.value = "";
  };

  // 이미지 수정 핸들러
  const handleImageUpdate = async (
    oldImage: MainImage,
    file: File,
    index: number
  ) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // 1. 기존 이미지 삭제
      await homeSettingsAPI.deleteMainImage(oldImage.url);

      // 2. 새 이미지 파일 업로드
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const response = await homeSettingsAPI.uploadMainImage(
        file,
        fileName,
        fileName
      );

      if (response.success && response.data) {
        const newImage = response.data;
        onImageUpdate?.(oldImage.url, newImage);

        // 최신 데이터 다시 불러오기
        if (onRefresh) {
          await onRefresh();
        } else {
          setUploadedImages((prev) =>
            prev.map((img) => (img.url === oldImage.url ? newImage : img))
          );
        }
      } else {
        setUploadError(response.message || "이미지 수정에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Image update error:", error);
      setUploadError(
        error.response?.data?.message || "이미지 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 삭제 핸들러
  const handleImageDelete = async (image: MainImage) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const response = await homeSettingsAPI.deleteMainImage(image.url);

      if (response.success) {
        onImageDelete?.(image.url);

        // 최신 데이터 다시 불러오기
        if (onRefresh) {
          await onRefresh();
        } else {
          setUploadedImages((prev) =>
            prev.filter((img) => img.url !== image.url)
          );
        }
      } else {
        setUploadError(response.message || "이미지 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Image delete error:", error);
      setUploadError(
        error.response?.data?.message || "이미지 삭제 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1">
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{uploadError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {imageList.map((slot, index) => {
          const uploadedImage = uploadedImages[index];
          const isUploaded = !!uploadedImage;
          const canAddMore = uploadedImages.length < maxImages;

          return (
            <div
              key={slot.id}
              className="relative aspect-video bg-[#737373] rounded-lg overflow-hidden group cursor-pointer pretendard"
              onClick={() => {
                if (!isUploaded && canAddMore && !isUploading) {
                  fileInputRefs.current[index]?.click();
                }
              }}
            >
              {/* 이미지가 업로드된 경우 */}
              {isUploaded ? (
                <>
                  <img
                    src={uploadedImage.url}
                    alt={uploadedImage.altKo || uploadedImage.alt || ""}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover 시 오버레이 */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity flex flex-col items-center justify-center">
                    {/* 중앙 이미지 수정하기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) {
                          fileInputRefs.current[index]?.click();
                        }
                      }}
                      disabled={isUploading}
                      className="bg-[rgba(238, 238, 238, 0.40)] bg-opacity-20 hover:bg-opacity-40 transition-all rounded-full w-20 h-20 flex flex-col items-center justify-center gap-1 text-white disabled:opacity-50"
                    >
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
                    </button>

                    {/* 우측 상단 이미지 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) {
                          handleImageDelete(uploadedImage);
                        }
                      }}
                      disabled={isUploading}
                      className="absolute top-2 right-2 text-white hover:bg-[rgba(238, 238, 238, 0.40)] hover:bg-opacity-20 transition-all rounded-full p-2 flex flex-col items-center gap-1 disabled:opacity-50"
                    >
                      <div className="border-2 border-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">
                        ✕
                      </div>
                      <span className="text-[10px] font-[400] whitespace-nowrap">
                        이미지 삭제
                      </span>
                    </button>
                  </div>

                  {/* 숨겨진 파일 인풋 (이미지 수정용) */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpdate(uploadedImage, file, index);
                      }
                      e.target.value = "";
                    }}
                  />
                </>
              ) : (
                // 이미지가 없는 경우 (빈 슬롯)
                <div
                  className={`w-full h-full flex flex-col items-center justify-center ${
                    (!canAddMore || isUploading) &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-400 group-hover:bg-gray-500 transition-colors flex flex-col items-center justify-center">
                    {isUploading ? (
                      <div className="text-white text-[12px]">업로드 중...</div>
                    ) : (
                      <>
                        <div className="text-white text-[12px]">+</div>
                        <div className="text-white text-[12px] ">이미지</div>
                        <div className="text-white text-[12px]">추가하기</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 숨겨진 파일 인풋 */}
              {!isUploaded && (
                <input
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { MainImage as UploadedImage };
