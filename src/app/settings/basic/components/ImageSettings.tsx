import ImageSelect from "./ImageSelect";
export default function ImageSettings() {
  return (
    <div className="pretendard w-full gap-[40px] flex flex-col gap-[40px]">
      <header className=" flex flex-row items-center gap-[20px] font-semibold">
        <span className="text-[#171717] text-[24px] ">대표 이미지 설정</span>
        <span className="text-[#2B7FFF] text-[16px] ">
          최소 3개/ 최대 5개의 이미지를 업로드 해주세요
        </span>
      </header>
      <main className="w-full ">
        <ImageSelect />
      </main>
    </div>
  );
}
