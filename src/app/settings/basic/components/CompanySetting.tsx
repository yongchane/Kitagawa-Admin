"use client";
import { useMemo, useState } from "react";
import { infoAPI, DEFAULT_COMPANY_DATA } from "@/api/info";

const formlist = [
  {
    title: "회사명",
    name: "companyName",
    type: "text",
    placeholder: "회사명을 입력해주세요",
    required: true,
  },
  {
    title: "CEO명",
    name: "ceo",
    type: "text",
    placeholder: "CEO명을 입력해주세요",
    required: true,
  },
  {
    title: "주소",
    name: "address",
    type: "text",
    placeholder: "주소를 입력해주세요",
    required: false,
  },
  {
    title: "전화번호",
    name: "phone",
    type: "text",
    placeholder: "'-' 없이 입력해주세요 (예: 0220262222)",
    required: true,
  },
  {
    title: "휴대전화",
    name: "mobile",
    type: "text",
    placeholder: "'-' 없이 입력해주세요 (예: 01036169973)",
    required: false,
  },
  {
    title: "팩스",
    name: "fax",
    type: "text",
    placeholder: "'-' 없이 입력해주세요 (예: 0220262223)",
    required: false,
  },
  {
    title: "이메일",
    name: "email",
    type: "email",
    placeholder: "이메일을 입력해주세요",
    required: false,
  },
  {
    title: "웹사이트",
    name: "website",
    type: "url",
    placeholder: "웹사이트 URL을 입력해주세요 (예: https://www.kitagawa.co.kr)",
    required: false,
  },
];

type Props = {
  agree: boolean;
  setAgree: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CompanySetting({ agree, setAgree }: Props) {
  // 상태: 각 입력값 저장 (기본값으로 초기화)
  const [values, setValues] = useState<Record<string, string>>(() => ({
    companyName: DEFAULT_COMPANY_DATA.companyName,
    ceo: DEFAULT_COMPANY_DATA.ceo,
    address: DEFAULT_COMPANY_DATA.address,
    phone: DEFAULT_COMPANY_DATA.phone,
    mobile: DEFAULT_COMPANY_DATA.mobile,
    fax: DEFAULT_COMPANY_DATA.fax,
    email: DEFAULT_COMPANY_DATA.email,
    website: DEFAULT_COMPANY_DATA.website,
  }));

  // 포커스/터치/제출 시도 상태
  const [focused, setFocused] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = (name: string) => setFocused(name);
  const handleBlur = (name: string) => {
    setFocused((prev) => (prev === name ? null : prev));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // 필드별 에러 정의 (전화번호 하이픈 금지, 이메일/웹사이트 형식)
  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    // 전화번호 검증
    const phone = (values["phone"] || "").trim();
    if (phone && !/^[0-9]+$/.test(phone)) {
      e["phone"] = "'-' 없이 숫자만 입력해주세요";
    }

    // 휴대전화 검증
    const mobile = (values["mobile"] || "").trim();
    if (mobile && !/^[0-9]+$/.test(mobile)) {
      e["mobile"] = "'-' 없이 숫자만 입력해주세요";
    }

    // 팩스 검증
    const fax = (values["fax"] || "").trim();
    if (fax && !/^[0-9]+$/.test(fax)) {
      e["fax"] = "'-' 없이 숫자만 입력해주세요";
    }

    // 이메일 검증
    const email = (values["email"] || "").trim();
    if (
      email &&
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      e["email"] = "올바른 이메일 형식을 입력해주세요";
    }

    // 웹사이트 검증
    const website = (values["website"] || "").trim();
    if (website && !/^https?:\/\/.+/.test(website)) {
      e["website"] = "올바른 URL 형식을 입력해주세요 (http:// 또는 https://)";
    }

    return e;
  }, [values]);

  const requiredFilled = useMemo(
    () =>
      formlist
        .filter((f) => f.required)
        .every((f) => (values[f.name] || "").trim().length > 0),
    [values]
  );

  // const hasErrors = Object.keys(errors).length > 0;
  // const canSubmit = agree && requiredFilled && !hasErrors;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // if (!canSubmit) {
    //   return;
    // }

    try {
      const response = await infoAPI.submitInfoPatch({
        companyName: values["companyName"],
        ceo: values["ceo"],
        address: values["address"],
        phone: values["phone"],
        mobile: values["mobile"],
        fax: values["fax"],
        email: values["email"],
        website: values["website"],
      });

      if (response.success) {
        alert(response.message || "기본 정보가 성공적으로 저장되었습니다.");
      } else {
        alert(response.message || "기본 정보 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("기본 정보 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="pretendard w-full mt-[10px]">
      <div className="flex items-center  font-[600] gap-[20px]">
        <h1 className="text-[#171717] text-[24px] ">기본 정보 설정</h1>
        <h2 className="text-[#2B7FFF] text-[16px]">
          {" "}
          필수 항목을 입력해주세요
        </h2>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col md:grid md:grid-cols-2 gap-[24px] w-full h-[auto] mt-[36px]"
      >
        {formlist.map((item) => {
          const name = item.name;
          const value = values[name] || "";
          const isFocused = focused === name;
          const isFilled = value.trim().length > 0;
          const showRequiredError =
            !!item.required && (submitAttempted || touched[name]) && !isFilled;
          const fieldError = errors[name];
          const hasFieldError = !!fieldError || showRequiredError;

          return (
            <div key={name} className="w-full">
              <label className="pretendard text-[16px] font-[600] text-[#171717] mb-[8px] flex items-center">
                {item.title}
                {item.required ? (
                  <span className="pretendard text-[14px] font-[500] text-[#2B7FFF] ml-[4px]">
                    (필수)
                  </span>
                ) : (
                  <span className="pretendard text-[14px] font-[500] text-[#737373] ml-[4px]">
                    (선택)
                  </span>
                )}
              </label>

              <input
                name={name}
                placeholder={item.placeholder}
                value={value}
                onChange={handleChange}
                onFocus={() => handleFocus(name)}
                onBlur={() => handleBlur(name)}
                type={item.type}
                required={!!item.required}
                aria-required={!!item.required}
                aria-invalid={hasFieldError}
                inputMode={
                  name === "phone" || name === "mobile" || name === "fax"
                    ? "numeric"
                    : undefined
                }
                pattern={
                  name === "phone" || name === "mobile" || name === "fax"
                    ? "[0-9]*"
                    : undefined
                }
                className={`w-full h-[40px] rounded-[8px] p-[12px] focus:outline-none transition-colors ${
                  hasFieldError
                    ? "border-[2px] border-[#FB2C36]"
                    : isFocused
                    ? "border-[2px] border-[#2B7FFF]"
                    : "border-[1px] border-[#D4D4D4]"
                }`}
              />

              {/* 사무실 및 AS 센터 위치 입력란 (추후 구현 시 사용)
              {item.locationplaceholder && (
                <input
                  placeholder={item.locationplaceholder}
                  className={`mt-[8px] w-full h-[40px] rounded-[8px] p-[12px] focus:outline-none transition-colors ${
                    hasFieldError
                      ? "border-[2px] border-[#FB2C36]"
                      : isFocused
                      ? "border-[2px] border-[#2B7FFF]"
                      : "border-[1px] border-[#D4D4D4]"
                  }`}
                />
              )} */}
              {/* 도움말/에러 메시지 */}
              {fieldError && (
                <div className="mt-[6px] text-right pretendard text-[12px] text-[#FB2C36]">
                  {fieldError}
                </div>
              )}
              {!fieldError && showRequiredError && (
                <div className="mt-[6px] flex items-center justify-end gap-[6px] pretendard text-[12px] text-[#FB2C36]">
                  <span className="inline-block w-[6px] h-[6px] rounded-full bg-[#FB2C36]" />
                  <span>필수 항목을 채워 주세요</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="col-span-2 mt-[80px] flex flex-col justify-center items-center">
          {/* 안내 문구: 비활성 시 노출 */}
          {!requiredFilled && (
            <div className="flex items-center mb-[8px]">
              <img
                src="/error.svg"
                alt="error"
                className="inline-block mr-[4px]"
              />
              <div className="pretendard font-[600] text-[14px] text-[#FB2C36]">
                {!requiredFilled
                  ? "필수항목을 전부 작성해 주시기 바랍니다."
                  : "입력 형식을 확인해 주시기 바랍니다."}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!requiredFilled}
            onClick={() => setAgree(!agree)}
            className={`${
              requiredFilled
                ? "bg-[#0089D1] text-white hover:bg-[#007DBE] "
                : "bg-[#EEE] text-[#D4D4D4] cursor-not-allowed"
            } w-[392px]  px-[16px] py-[8px] rounded-[9999px] transition-colors`}
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
}
