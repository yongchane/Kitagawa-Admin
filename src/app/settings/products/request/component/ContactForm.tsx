"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestAPI } from "@/api/request";
import SubmitSuccess from "./SubmitSuccess";
import { useSubmit } from "@/contexts/ReaquestContext";

interface FormData {
  productName: string;
  seriesName: string;
  url: string;
  requestDetails: string;
}

export default function ContactForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    seriesName: "",
    url: "",
    requestDetails: "",
  });
  const { submitSuccess, setSubmitSuccess } = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputList = [
    {
      title: "제품명",
      placeholder: "제품명을 입력해주세요",
      value: formData.productName,
      name: "productName" as keyof FormData,
    },
    {
      title: "시리즈명",
      placeholder: "시리즈명을 입력해주세요",
      value: formData.seriesName,
      name: "seriesName" as keyof FormData,
    },
    {
      title: "URL",
      placeholder: "일본 기타가와에서 제품 URL을 입력해주세요",
      value: formData.url,
      name: "url" as keyof FormData,
    },

    {
      title: "요청사항",
      placeholder: "요청사항을 입력해주세요",
      value: formData.requestDetails,
      name: "requestDetails" as keyof FormData,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최소 1개 이상의 필드가 입력되었는지 확인
    if (
      !formData.productName &&
      !formData.seriesName &&
      !formData.url &&
      !formData.requestDetails
    ) {
      alert("1개 이상의 항목을 작성해 주시기 바랍니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestAPI.submitProductRequest({
        productName: formData.productName,
        seriesName: formData.seriesName,
        url: formData.url,
        requestDetails: formData.requestDetails,
        autoImport: !!formData.url, // URL이 있으면 자동 크롤링 활성화
      });

      if (response.success) {
        // 성공 시 폼 초기화 및 성공 메시지 표시
        setSubmitSuccess(true);
        setFormData({
          productName: "",
          seriesName: "",
          url: "",
          requestDetails: "",
        });

        // 2초 후 products 페이지로 리다이렉트
        // setTimeout(() => {
        //   router.push("/settings/products");
        // }, 2000);
      } else {
        alert(response.message || "문의 제출에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "문의 제출 중 오류가 발생했습니다."
      );
    }
  };

  const isFormValid =
    formData.productName ||
    formData.seriesName ||
    formData.url ||
    formData.requestDetails;

  // 테스트를 위한 임시 함수 제출
  // const handleTestSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   console.log("Form submitted:", formData);
  //   console.log("테스트 전송");
  //   if (
  //     !formData.productName &&
  //     !formData.seriesName &&
  //     !formData.url &&
  //     !formData.requestDetails
  //   ) {
  //     alert("1개 이상의 항목을 작성해 주시기 바랍니다.");
  //     return;
  //   }
  //   try {
  //     setSubmitSuccess(true);
  //     setFormData({
  //       productName: "",
  //       seriesName: "",
  //       url: "",
  //       requestDetails: "",
  //     });
  //   } catch (error) {
  //     console.error("Submit error:", error);
  //     alert("문의 제출 중 오류가 발생했습니다.");
  //   }
  // };

  return (
    //테스트를 위한 onSubmit={handleSubmit} 제거
    <form onSubmit={handleSubmit} className="flex flex-col gap-[36px] ">
      <h2 className="w-full border-b-[1px] text-[#0089D1] text-[20px] font-[600] ">
        새로운 제품 추가시 다음 양식을 채워주세요
      </h2>
      <div>
        {inputList.map(
          (input, index) =>
            index < 3 && (
              <div key={input.name}>
                <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
                  <span>{input.title}</span>
                  <p className="text-[#737373]  text-[14px] font-[500] ">
                    (선택)
                  </p>
                </div>
                <input
                  name={input.name}
                  value={input.value}
                  onChange={handleInputChange}
                  type="text"
                  placeholder={input.placeholder}
                  className="w-full mb-[24px] px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
                />
              </div>
            )
        )}
      </div>
      <h2 className="w-full border-b-[1px] text-[#0089D1] text-[20px] font-[600] ">
        요청사항이 있다면 다음 양식을 채워주세요
      </h2>
      <div>
        {inputList.map(
          (input, index) =>
            index === 3 && (
              <div key={input.name}>
                <div className="flex flex-row justify-start items-center text-[16px] text-[#171717] font-[600] mb-[14px] gap-[4px]">
                  <span>{input.title}</span>
                  <p className="text-[#737373]  text-[14px] font-[500] ">
                    (선택)
                  </p>
                </div>
                <textarea
                  name={input.name}
                  value={input.value}
                  onChange={handleInputChange}
                  placeholder={input.placeholder}
                  className="w-full h-[130px] mb-[4px] px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] font-[500] text-[#404040] focus:outline-none focus:border-[#0089D1]"
                />

                {/* 글자 수 카운트 */}
                <span className="flex justify-end text-[#737373] text-[12px] font-[500]">
                  {formData.requestDetails.length} / 1000
                </span>
              </div>
            )
        )}
      </div>
      <div></div>
      <div className="flex flex-col justify-end items-end gap-[13px] mt-[20px]">
        {!isFormValid && (
          <div className="flex items-center justify-end text-[#FB2C36] text-[14px] font-[600]">
            <img
              src="/error.svg"
              alt="error"
              className="inline-block mr-[4px]"
            />
            <span>1개 이상의 항목을 작성해 주시기 바랍니다.</span>
          </div>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting || submitSuccess}
          className={`w-[272px] h-[40px] px-[16px] py-[8px] text-white rounded-[9999px] ${
            isFormValid && !isSubmitting && !submitSuccess
              ? "bg-[#0089D1]"
              : "bg-[#EEEEEE]"
          }`}
        >
          {isSubmitting
            ? "제출 중..."
            : submitSuccess
            ? "제출 완료"
            : "문의하기"}
        </button>
      </div>
    </form>
  );
}
