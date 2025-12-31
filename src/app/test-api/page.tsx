"use client";

import { useState } from "react";
import { productsAPI } from "@/api/products";
import { uploadFileToGCP } from "@/utils/fileUpload";

interface TestResult {
  name: string;
  success: boolean;
  data: unknown;
  timestamp: string;
}

export default function TestAPIPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (name: string, success: boolean, data: unknown) => {
    setTestResults((prev) => [
      ...prev,
      {
        name,
        success,
        data,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // 1. Level 2 카테고리 조회 테스트
  const testGetLevel2Categories = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getLevel2CategoriesBySlug(
        "nc-rotary-table"
      );
      addResult("Level 2 카테고리 조회", response.success, response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      addResult("Level 2 카테고리 조회", false, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 2. 파일 업로드 테스트
  const testFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const response = await uploadFileToGCP(file, "product");
      addResult("파일 업로드", response.success, response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      addResult("파일 업로드", false, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      testFileUpload(file);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">API 테스트 페이지</h1>

      {/* 테스트 버튼들 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">테스트 실행</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testGetLevel2Categories}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Level 2 카테고리 조회 테스트
          </button>

          <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
            파일 업로드 테스트
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>

          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            결과 초기화
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-blue-600">테스트 진행 중...</div>
        )}
      </div>

      {/* 테스트 결과 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          테스트 결과 ({testResults.length})
        </h2>

        {testResults.length === 0 ? (
          <p className="text-gray-500">아직 테스트를 실행하지 않았습니다.</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded ${
                  result.success
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{result.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      result.success
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {result.success ? "성공" : "실패"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {result.timestamp}
                </p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
