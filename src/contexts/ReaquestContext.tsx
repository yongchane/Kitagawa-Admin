"use client";

import { createContext, useContext, useState } from "react";

// 상태 관련 타입 선언
interface SubmitContextType {
  submitSuccess: boolean;
  setSubmitSuccess: (value: boolean) => void;
}

// 컨텍스트 생성
export const SubmitSuccessContext = createContext<
  SubmitContextType | undefined
>(undefined);

export function SubmitProvider({ children }: { children: React.ReactNode }) {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  return (
    <SubmitSuccessContext.Provider value={{ submitSuccess, setSubmitSuccess }}>
      {children}
    </SubmitSuccessContext.Provider>
  );
}

export function useSubmit() {
  const context = useContext(SubmitSuccessContext);
  if (!context)
    throw new Error("useSubmit must be used within a SubmitProvider");
  return context;
}
