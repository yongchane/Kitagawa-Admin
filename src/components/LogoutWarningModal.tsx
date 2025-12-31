"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function LogoutWarningModal() {
  const { timeUntilLogout, resetActivityTimer } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(timeUntilLogout !== null && timeUntilLogout > 0);
  }, [timeUntilLogout]);

  if (!isVisible || timeUntilLogout === null) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center">
          <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              세션 만료 경고
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-gray-700">
            활동이 없어 곧 자동으로 로그아웃됩니다.
          </p>
          <p className="text-2xl font-bold text-red-600">
            {formatTime(timeUntilLogout)}
          </p>
          <p className="mt-2 text-sm text-gray-600">
            계속 작업하시려면 아래 버튼을 클릭하세요.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={resetActivityTimer}
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            세션 연장
          </button>
        </div>
      </div>
    </div>
  );
}
