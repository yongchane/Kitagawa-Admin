"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import path from "path";

const menu = [
  { name: "기본 정보 설정", href: "/settings/basic" },
  { name: "제품 설정", href: "/settings/products" },
];

export default function NavMenu() {
  const pathname = usePathname();

  // 현재 경로가 특정 메뉴 항목과 일치하는지 확인
  const isActive = (href: string) => {
    if (!pathname) return false;
    // 정확히 일치하거나, 하위 경로인 경우
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {pathname !== "/settings/products/request" && (
        <>
          <div className="w-full px-[48px] pt-[48px] pb-[16px]">
            <h1 className="text-[40px] text-[#004B73] font-bold">Admin Page</h1>
          </div>
          <nav className="pretendard w-full  flex justify-center items-center gap-[50px] ">
            {menu.map((item) => (
              <ul className="flex flex-row" key={item.name}>
                <Link href={item.href} className=" text-[16px]  font-medium ">
                  <li
                    className={`flex justify-center items-center w-[390px] h-[48px] border border-[#0089D1] rounded-[9999px] ${
                      isActive(item.href)
                        ? "bg-[#0089D1] text-white"
                        : "text-[#0089D1]"
                    }`}
                  >
                    {item.name}
                  </li>
                </Link>
              </ul>
            ))}
          </nav>
        </>
      )}
    </>
  );
}
