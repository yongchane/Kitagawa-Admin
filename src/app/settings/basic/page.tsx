"use client";

import ImageSettings from "@/app/settings/basic/components/ImageSettings";
import CompanySetting from "./components/CompanySetting";
import { useState } from "react";
export default function BasicSettingsPage() {
  const [agree, setAgree] = useState(false);
  return (
    <div>
      <ImageSettings />
      <CompanySetting agree={agree} setAgree={setAgree} />
    </div>
  );
}
