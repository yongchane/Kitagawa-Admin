"use client";

interface BackButtonProps {
  onBackClick: () => void;
}

export default function BackButton({ onBackClick }: BackButtonProps) {
  return (
    <div className="flex flex-row justify-start items-center w-full h-[58px] border-b-[1px] border-[E5E5E5]">
      <button onClick={onBackClick} className="flex items-center">
        <img
          src="/back.svg"
          alt="back icon"
          className="inline-block mr-[8px] p-[12px]"
        />
      </button>
      <span>Admin page로 돌아가기</span>
    </div>
  );
}
