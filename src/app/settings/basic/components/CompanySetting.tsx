"use client";
import { useMemo, useState } from "react";

// 메일 작성 관련 api 연동 필요
const formlist = [
  {
    title: "E-mail",
    name: "companyName",
    type: "text",
    placeholder: "기타가와 대표 이메일을 입력해주세요",
    required: true,
  },
  {
    title: "담당자명",
    name: "contactName",
    type: "text",
    placeholder: "담당자명 작성해주세요",
    required: true,
  },
  {
    title: "전화번호 (Tel)",
    name: "phone",
    type: "text",
    placeholder: "'-' 없이 작성해주세요 (예: 01012345678)",
    required: true,
  },
  {
    title: "전화번호 (Mo)",
    name: "phoneMobile",
    type: "text",
    placeholder: "'-' 없이 작성해주세요 (예: 01012345678)",
    required: false,
  },
  {
    title: "사무실 위치",
    name: "companyLocation",
    type: "location",
    placeholder: "도로명, 건물명 또는 지번으로 검색해주세요",
    locationplaceholder: "상세 주소를 입력해주세요",
    required: true,
  },
  {
    title: "AS 센터 위치",
    name: "companyASLocation",
    type: "location",
    placeholder: "도로명, 건물명 또는 지번으로 검색해주세요",
    locationplaceholder: "상세 주소를 입력해주세요",
    required: true,
  },
];

type Props = {
  agree: boolean;
  setAgree: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CompanySetting({ agree, setAgree }: Props) {
  // 상태: 각 입력값 저장 (간단한 required 체크용)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(formlist.map((f) => [f.name, ""]))
  );

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

  // 필드별 에러 정의 (예: 전화번호 하이픈 금지, 이메일 형식)
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const phone = (values["phone"] || "").trim();
    if (phone && !/^[0-9]+$/.test(phone)) {
      e["phone"] = "'-' 없이 입력해주세요";
    }
    const email = (values["companyEmail"] || "").trim();
    if (
      email &&
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      e["companyEmail"] = "올바른 이메일 형식을 입력해주세요";
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

  const hasErrors = Object.keys(errors).length > 0;
  const canSubmit = agree && requiredFilled && !hasErrors;

  const onSubmit = (e: React.FormEvent) => {
    setSubmitAttempted(true);
    if (!canSubmit) {
      e.preventDefault();
      return;
    }
    // TODO: 실제 전송 로직 연결
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
                  name === "phone" || name === "phoneMobile"
                    ? "numeric"
                    : undefined
                }
                pattern={
                  name === "phone" || name === "phoneMobile"
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
              )}
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
          {!canSubmit && (
            <div className="flex items-center mb-[8px]">
              <img
                src="/error.svg"
                alt="error"
                className="inline-block mr-[4px]"
              />
              <div className="pretendard font-[600] text-[14px] text-[#FB2C36]">
                필수항목을 전부 작성해 주시기 바랍니다.
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            onClick={() => setAgree(!agree)}
            className={`${
              canSubmit
                ? "bg-[#0089D1] text-white hover:bg-[#007DBE] "
                : "bg-[#EEE] text-[#D4D4D4] cursor-not-allowed"
            } w-[392px]  px-[16px] py-[8px] rounded-[9999px] transition-colors`}
          >
            접수하기
          </button>
        </div>
      </form>
    </div>
  );
}
