import Link from "next/link";
import AdminSettings from "../components/AdminSettings";

export default function ProductsPage() {
  return (
    <div className="p-[48px]">
      <div className="flex justify-between items-start mb-[24px]">
        <div />
        <Link
          href="/settings/products/create"
          className="flex items-center gap-[8px] px-[24px] py-[12px] bg-[#0089D1] text-white rounded-[8px] text-[14px] font-[600] hover:bg-[#0077B8] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          제품 직접 등록
        </Link>
      </div>
      <AdminSettings
        title="메인 제품 설정"
        subtitle="최소 3개의 제품을 설정해주세요"
      />
    </div>
  );
}
