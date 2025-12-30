"use client";

import { useRouter } from "next/navigation";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmModal({ isOpen, onClose }: ConfirmModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    router.push("/settings/products");
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-[40px] max-w-[520px] w-full mx-[20px] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] w-[24px] h-[24px] flex items-center justify-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" fill="#2B7FFF" />
            <path
              d="M8 8L16 16M16 8L8 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[20px] font-semibold text-[#171717] mb-[24px]">
            Admin Page 로 돌아가시겠어요?
          </h2>
          <p className="text-[16px] text-[#404040] mb-[8px]">
            지금까지 작성한 양식이 삭제됩니다.
          </p>
          <p className="text-[16px] text-[#404040] mb-[40px]">
            새로운 제품 추가시 요청 폼을 요청사항이 있으시면 문의하기 버튼을
            눌러주세요.
          </p>

          {/* Arrow icon */}
          <div className="mb-[40px]">
            <svg
              width="40"
              height="24"
              viewBox="0 0 40 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 0L20 18M20 18L12 10M20 18L28 10"
                stroke="#2B7FFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Buttons */}
          <div className="flex gap-[16px] w-full">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#2B7FFF] text-white rounded-[100px] py-[12px] px-[24px] text-[16px] font-semibold hover:bg-[#1a6fe6] transition-colors"
            >
              삭제하고 돌아가기
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white border-[2px] border-[#2B7FFF] text-[#2B7FFF] rounded-[100px] py-[12px] px-[24px] text-[16px] font-semibold hover:bg-[#f0f7ff] transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
