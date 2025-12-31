"use client";

import { useState } from "react";
import ContactForm from "./ContactForm";
import ConfirmModal from "./ConfirmModal";

export default function RequestPageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="pretendard w-full gap-[40px] flex flex-col gap-[40px]">
        <header className="w-full flex flex-col items-center gap-[20px] font-semibold pt-[100px]">
          <h1 className="text-[#004B73] font-[700] text-[40px]">
            Contact here
          </h1>
          <span className="text-[#004B73] text-[20px]">
            새로운 제품이 출시 되었거나, 요청사항이 있으면 아래에 문의 사항을
            작성해주세요
          </span>
          <div className="flex flex-row justify-start items-center w-full h-[58px] border-b-[1px] border-[E5E5E5]">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center"
            >
              <img
                src="/back.svg"
                alt="back icon"
                className="inline-block mr-[8px] p-[12px]"
              />
            </button>
            <span>Admin page로 돌아가기</span>
          </div>
        </header>
        <main className="w-full p-[48px]">
          <main className="flex flex-col justify-center items-center xl:w-[1280px] xl:mx-auto w-full h-[auto] md:px-[48px]  ">
            <div className="md:mt-[48px] md:p-[20px] md:shadow-[1px_1px_10px_0_rgba(0,0,0,0.3)] md:rounded-[8px] w-full h-[auto] p-[20px]">
              <ContactForm />
            </div>
          </main>
        </main>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
