"use client";

import { useRef } from "react";

interface UploadedImage {
  id: number;
  file: File;
  preview: string;
}

interface ImageSlotProps {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  maxImages?: number;
}

const imageList = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

export default function ImageSlot({
  uploadedImages,
  setUploadedImages,
  maxImages = 5,
}: ImageSlotProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 이미지 업로드 핸들러
  const handleImageUpload = (file: File) => {
    const preview = URL.createObjectURL(file);
    const newImage: UploadedImage = {
      id: Date.now(),
      file,
      preview,
    };

    setUploadedImages((prev) => [...prev, newImage]);
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadedImages.length < maxImages) {
      handleImageUpload(file);
    }
  };

  // 이미지 삭제 핸들러
  const handleImageDelete = (id: number) => {
    setUploadedImages((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.preview); // 메모리 해제
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  return (
    <div className="flex-1">
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
                if (!isUploaded && canAddMore) {
                  fileInputRefs.current[index]?.click();
                }
              }}
            >
              {/* 이미지가 업로드된 경우 */}
              {isUploaded ? (
                <>
                  <img
                    src={uploadedImage.preview}
                    alt={uploadedImage.file.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover 시 오버레이 */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-60 transition-opacity flex flex-col items-center justify-center">
                    {/* 중앙 이미지 수정하기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefs.current[index]?.click();
                      }}
                      className="bg-[rgba(238, 238, 238, 0.40)] bg-opacity-20 hover:bg-opacity-40 transition-all rounded-full w-20 h-20 flex flex-col items-center justify-center gap-1 text-white"
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
                        handleImageDelete(uploadedImage.id);
                      }}
                      className="absolute top-2 right-2 text-white hover:bg-[rgba(238, 238, 238, 0.40)] hover:bg-opacity-20 transition-all rounded-full p-2 flex flex-col items-center gap-1"
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
                        // 기존 이미지를 새 이미지로 교체
                        const preview = URL.createObjectURL(file);
                        URL.revokeObjectURL(uploadedImage.preview); // 기존 메모리 해제
                        setUploadedImages((prev) =>
                          prev.map((img) =>
                            img.id === uploadedImage.id
                              ? { ...img, file, preview }
                              : img
                          )
                        );
                      }
                    }}
                  />
                </>
              ) : (
                // 이미지가 없는 경우 (빈 슬롯)
                <div
                  className={`w-full h-full flex flex-col items-center justify-center ${
                    !canAddMore && "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-400 group-hover:bg-gray-500 transition-colors flex flex-col items-center justify-center">
                    <div className="text-white text-[12px]">+</div>
                    <div className="text-white text-[12px] ">이미지</div>
                    <div className="text-white text-[12px]">추가하기</div>
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
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { UploadedImage };
