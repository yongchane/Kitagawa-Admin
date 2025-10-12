import ImageSelect from "./ImageSelect";
export default function AdminSettings({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="pretendard w-full gap-[40px] flex flex-col gap-[40px]">
      <header className=" flex flex-row items-center gap-[20px] font-semibold">
        <span className="text-[#171717] text-[24px] ">{title}</span>
        <span className="text-[#2B7FFF] text-[16px] ">{subtitle}</span>
      </header>
      <main className="w-full ">
        <ImageSelect />
      </main>
    </div>
  );
}
