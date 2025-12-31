"use client";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SubmitSuccess() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/settings/basic");
  };

  return (
    <div className="flex flex-col items-center justify-center md:h-screen w-full px-[20px] py-[48px]">
      <h1 className="pretendard text-[48px] md:text-[64px] font-[700] text-[#0D4C7F] mb-[24px]">
        Complete!
      </h1>

      <p className="pretendard text-[18px] md:text-[20px] font-[500] text-[#171717] mb-[48px]">
        접수를 완료했습니다!
      </p>

      {/* 로띠 애니메이션이 들어갈 자리 */}
      <div className="w-[200px] h-[200px] mb-[48px] flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/2b79d43c-08a9-4b79-a05f-cd2c1ac8c672/GpunMrOI6J.lottie"
          loop
          autoplay
        />
      </div>

      <button
        onClick={handleGoHome}
        className="flex items-center justify-center gap-[8px] bg-[#0089D1] text-white pretendard text-[16px] font-[600] px-[32px] py-[12px]  rounded-[9999px] hover:bg-[#007DBE] transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 10L10 3L17 10M4 9V17C4 17.5523 4.44772 18 5 18H8V14C8 13.4477 8.44772 13 9 13H11C11.5523 13 12 13.4477 12 14V18H15C15.5523 18 16 17.5523 16 17V9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Admin page로 바로가기
      </button>
    </div>
  );
}
