"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const menu = [
  { name: "기본 정보 설정", href: "/settings/basic" },
  { name: "제품 설정", href: "/settings/products" },
];

export default function NavMenu() {
  const pathname = usePathname();
  const isSelected = (href: string) => pathname === href;
  return (
    <nav className="pretendard w-full  flex justify-center items-center gap-[50px] ">
      {menu.map((item) => (
        <ul className="flex flex-row" key={item.name}>
          <Link href={item.href} className=" text-[16px]  font-medium ">
            <li
              className={`flex justify-center items-center w-[390px] h-[48px] border border-[#0089D1] rounded-[9999px] ${
                isSelected(item.href)
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
  );
}
