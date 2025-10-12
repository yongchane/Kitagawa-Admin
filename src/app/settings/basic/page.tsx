"use client";

import AdminSettings from "@/app/settings/components/AdminSettings";
import CompanySetting from "./components/CompanySetting";
import { useState } from "react";
export default function BasicSettingsPage() {
  const [agree, setAgree] = useState(false);
  return (
    <div>
      <AdminSettings
        title="대표 이미지 설정"
        subtitle="최소 3개/ 최대 5개의 이미지를 업로드 해주세요"
      />
      <CompanySetting agree={agree} setAgree={setAgree} />
    </div>
  );
}
