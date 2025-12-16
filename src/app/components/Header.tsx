"use client";

import { useRouter } from "next/navigation";
import { authAPI } from "@/api/auth";
import Link from "next/link";
export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // 로그아웃 처리
    authAPI.logout();
    // 로그인 페이지로 이동
    router.push("/login");
  };

  return (
    <header className="pretendard flex flex-row items-center gap-[16px] px-[48px] py-[8px] bg-[#007DBE] text-white">
      <Link href="/settings/basic">
        <img
          src="/logo/kitagawa.svg"
          alt="Kitagawa Admin"
          className="w-[123px] h-[30px]"
        />
      </Link>
      <div className="flex flex-row gap-[8px] items-center font-semibold">
        <span className="ml-4 text-[14px] ">관리자 페이지입니다.</span>
        <button onClick={handleLogout} className="text-[16px] hover:underline">
          로그아웃
        </button>
      </div>
    </header>
  );
}
