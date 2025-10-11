export default function Header() {
  return (
    <header className="pretendard flex flex-row items-center gap-[16px] px-[48px] py-[8px] bg-[#007DBE] text-white">
      <img
        src="/logo/kitagawa.svg"
        alt="Kitagawa Admin"
        className="w-[123px] h-[30px]"
      />
      <div className="flex flex-row gap-[8px] items-center font-semibold">
        <span className="ml-4 text-[14px] ">관리자 페이지입니다.</span>
        <button className="text-[16px]">로그아웃</button>
      </div>
    </header>
  );
}
