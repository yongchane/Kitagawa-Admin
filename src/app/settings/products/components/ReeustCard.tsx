import Link from "next/link";
export default function RequestCard() {
  return (
    <div className="flex flex-col w-full border-[1px]  border-[#0089D1] bg-[#fff] rounded-[12px] p-[20px] cursor-pointer duration-300 hover:border-[#0089D1] hover:bg-[#E6F3FA] items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-[12px]">
        <span className="text-[16px] font-[600] text-center text-[#404040] pretendard">
          새로운 제품이 출시 되었거나,
          <br /> 요청사항이 있으면 <br /> 아래로 문의주세요
        </span>
      </div>
      <img
        src="/new.svg"
        alt="new product"
        className="mt-[36px] mb-[12px] w-[54px] h-[16px]"
      />
      <Link
        href="/settings/products/request"
        className="w-[139px] h-[48px] bg-[#0089D1] rounded-[9999px] text-white justify-center flex items-center font-[600] text-[16px]"
      >
        {" "}
        Contact Here
      </Link>
    </div>
  );
}
