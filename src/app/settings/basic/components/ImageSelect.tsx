"use client";

// 이미지 업로드 api 연동 필요
// 인터렉션 수정 필요

import { useState, useRef } from "react";

const imageList = [
  {
    id: 1,
  },
  {
    id: 2,
  },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

interface UploadedImage {
  id: number;
  file: File;
  preview: string;
}

export default function ImageSelect() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
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
    if (file && uploadedImages.length < imageList.length) {
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

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  // 드롭 핸들러
  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null) return;

    setUploadedImages((prev) => {
      const updated = [...prev];
      const [draggedImage] = updated.splice(draggedItem, 1);
      updated.splice(dropIndex, 0, draggedImage);
      return updated;
    });

    setDraggedItem(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-row justify-between gap-[14%]">
        {/* 왼쪽: 이미지 슬롯 영역 */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {imageList.map((slot, index) => {
              const uploadedImage = uploadedImages[index];
              const isUploaded = !!uploadedImage;
              const canAddMore = uploadedImages.length < imageList.length;

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

        {/* 오른쪽: 드래그 리스트 영역 */}
        <div className="flex-1 bg-[#F5F5F5] border border-[#D4D4D4] rounded-lg pt-[16px] h-fit">
          <p className="text-blue-500 text-sm px-[16px] py-[12px]">
            이미지 순서를 드래그 해서 설정해보세요
          </p>

          {uploadedImages.length !== 0 && (
            <div className="">
              {uploadedImages.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`bg-[#F5F5F5] border border-gray-200  p-3 flex items-center gap-3 cursor-move hover:bg-gray-50 transition-colors ${
                    draggedItem === index ? "opacity-50" : ""
                  }`}
                >
                  {/* 드래그 핸들 아이콘 */}
                  <div className="text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path
                        d="M2 4h12M2 8h12M2 12h12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* 파일명 */}
                  <span className="text-sm text-gray-700 truncate">
                    {image.file.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* 페이지네이션 표시 */}
      <div className="text-center mt-4 text-[#737373] font-[500] text-[16px]">
        {uploadedImages.length}/{imageList.length}
      </div>
    </div>
  );
}
