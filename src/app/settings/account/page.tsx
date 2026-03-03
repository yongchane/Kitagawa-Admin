"use client";

import { useState, useEffect, useMemo } from "react";
import { authAPI, Admin } from "@/api/auth";
import AlertMessage from "../products/components/AlertMessage";
import PageHeader from "../products/components/PageHeader";
import SubmitButton from "../products/components/SubmitButton";

export default function AccountPage() {
  // 비밀번호 변경
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [isPwSubmitting, setIsPwSubmitting] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 아이디 변경
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // 관리자 등록
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    name: "",
  });

  // 관리자 목록
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // 삭제
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const admin = authAPI.getAdmin();

  // 관리자 목록 로드
  const loadAdmins = async () => {
    try {
      const response = await authAPI.getAllAdmins();
      if (response.success && response.data) {
        setAdmins(response.data);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // === 비밀번호 변경 ===
  const pwValidationError = useMemo(() => {
    if (pwForm.newPassword && pwForm.newPassword.length < 4) {
      return "새 비밀번호는 최소 4자 이상이어야 합니다.";
    }
    if (
      pwForm.newPassword &&
      pwForm.confirmPassword &&
      pwForm.newPassword !== pwForm.confirmPassword
    ) {
      return "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.";
    }
    return null;
  }, [pwForm.newPassword, pwForm.confirmPassword]);

  const isPwDisabled = useMemo(() => {
    return (
      !pwForm.currentPassword.trim() ||
      !pwForm.newPassword.trim() ||
      !pwForm.confirmPassword.trim() ||
      !!pwValidationError ||
      isPwSubmitting
    );
  }, [
    pwForm.currentPassword,
    pwForm.newPassword,
    pwForm.confirmPassword,
    pwValidationError,
    isPwSubmitting,
  ]);

  const handlePasswordSubmit = async () => {
    setPwError(null);
    setPwSuccess(null);
    if (pwValidationError) {
      setPwError(pwValidationError);
      return;
    }
    setIsPwSubmitting(true);
    try {
      const response = await authAPI.changePassword(
        pwForm.currentPassword,
        pwForm.newPassword
      );
      if (response.success) {
        setPwSuccess("비밀번호가 성공적으로 변경되었습니다.");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPwError(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err: any) {
      setPwError(
        err.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsPwSubmitting(false);
    }
  };

  // === 관리자 삭제 ===
  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const id = (deleteTarget as any)._id || (deleteTarget as any).id;
      const response = await authAPI.deleteAdmin(id);
      if (response.success) {
        setDeleteSuccess(
          `관리자 "${deleteTarget.username}"이(가) 삭제되었습니다.`
        );
        setDeleteTarget(null);
        loadAdmins();
      } else {
        setDeleteError(response.message || "삭제에 실패했습니다.");
        setDeleteTarget(null);
      }
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message || "삭제 중 오류가 발생했습니다."
      );
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // === 아이디 변경 ===
  const handleUsernameSubmit = async () => {
    setUsernameError(null);
    setUsernameSuccess(null);
    if (!newUsername.trim()) {
      setUsernameError("새 아이디를 입력해주세요.");
      return;
    }
    setIsUsernameSubmitting(true);
    try {
      const response = await authAPI.changeUsername(newUsername);
      if (response.success) {
        setUsernameSuccess("아이디가 변경되었습니다. 다시 로그인해주세요.");
        setNewUsername("");
        // localStorage의 admin 정보 업데이트
        const currentAdmin = authAPI.getAdmin();
        if (currentAdmin) {
          currentAdmin.username = newUsername;
          localStorage.setItem("admin", JSON.stringify(currentAdmin));
        }
      } else {
        setUsernameError(response.message || "아이디 변경에 실패했습니다.");
      }
    } catch (err: any) {
      setUsernameError(
        err.response?.data?.message || "아이디 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsUsernameSubmitting(false);
    }
  };

  // === 관리자 등록 ===
  const isRegisterDisabled = useMemo(() => {
    return (
      !registerForm.username.trim() ||
      !registerForm.password.trim() ||
      !registerForm.name.trim() ||
      isRegisterSubmitting
    );
  }, [
    registerForm.username,
    registerForm.password,
    registerForm.name,
    isRegisterSubmitting,
  ]);

  const handleRegisterSubmit = async () => {
    setRegisterError(null);
    setRegisterSuccess(null);
    setIsRegisterSubmitting(true);
    try {
      const response = await authAPI.register(
        registerForm.username,
        registerForm.password,
        registerForm.name
      );
      if (response.success) {
        setRegisterSuccess(
          `관리자 "${registerForm.name}" (${registerForm.username})가 등록되었습니다.`
        );
        setRegisterForm({ username: "", password: "", name: "" });
        loadAdmins();
      } else {
        setRegisterError(response.message || "관리자 등록에 실패했습니다.");
      }
    } catch (err: any) {
      setRegisterError(
        err.response?.data?.message || "관리자 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[48px] pretendard p-[40px] max-w-[800px]">
      {/* 섹션 1: 현재 계정 정보 */}
      <section className="flex flex-col gap-[24px]">
        <PageHeader
          title="계정 관리"
          subtitle="관리자 계정 정보를 관리합니다"
          titleColor="#004B73"
        />

        {admin && (
          <div className="p-[20px] bg-[#F5F5F5] rounded-[12px]">
            <p className="text-[16px] font-[600] text-[#404040] mb-[8px]">
              현재 로그인 계정
            </p>
            <div className="flex gap-[24px] text-[14px] text-[#737373]">
              <span>
                아이디:{" "}
                <span className="text-[#404040] font-[600]">
                  {admin.username}
                </span>
              </span>
              {admin.name && (
                <span>
                  이름:{" "}
                  <span className="text-[#404040] font-[600]">
                    {admin.name}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      <hr className="border-t border-[#D4D4D4]" />

      {/* 섹션 2: 아이디 변경 */}
      <section className="flex flex-col gap-[20px]">
        <h3 className="text-[20px] font-[700] text-[#404040]">아이디 변경</h3>

        {usernameError && <AlertMessage type="error" message={usernameError} />}
        {usernameSuccess && (
          <AlertMessage type="success" message={usernameSuccess} />
        )}

        <div className="flex gap-[12px] items-end">
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              새 아이디
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="새 아이디를 입력하세요"
            />
          </div>
          <button
            onClick={handleUsernameSubmit}
            disabled={!newUsername.trim() || isUsernameSubmitting}
            className={`px-[24px] py-[12px] rounded-[8px] text-[14px] font-[600] ${
              newUsername.trim() && !isUsernameSubmitting
                ? "bg-[#0089D1] text-white hover:bg-[#0077B8]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUsernameSubmitting ? "변경 중..." : "변경"}
          </button>
        </div>
      </section>

      <hr className="border-t border-[#D4D4D4]" />

      {/* 섹션 3: 비밀번호 변경 */}
      <section className="flex flex-col gap-[20px]">
        <h3 className="text-[20px] font-[700] text-[#404040]">비밀번호 변경</h3>

        {pwError && <AlertMessage type="error" message={pwError} />}
        {pwSuccess && <AlertMessage type="success" message={pwSuccess} />}

        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              현재 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, currentPassword: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="현재 비밀번호"
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              새 비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, newPassword: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="새 비밀번호 (최소 4자)"
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              새 비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, confirmPassword: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="새 비밀번호 확인"
            />
          </div>
          {pwValidationError && (
            <p className="text-[13px] text-red-500">{pwValidationError}</p>
          )}
        </div>

        <SubmitButton onClick={handlePasswordSubmit} disabled={isPwDisabled}>
          {isPwSubmitting ? "변경 중..." : "비밀번호 변경"}
        </SubmitButton>
      </section>

      <hr className="border-t border-[#D4D4D4]" />

      {/* 섹션 4: 관리자 등록 */}
      <section className="flex flex-col gap-[20px]">
        <h3 className="text-[20px] font-[700] text-[#404040]">
          새 관리자 등록
        </h3>

        {registerError && <AlertMessage type="error" message={registerError} />}
        {registerSuccess && (
          <AlertMessage type="success" message={registerSuccess} />
        )}

        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={registerForm.username}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, username: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="관리자 아이디"
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="비밀번호"
            />
          </div>
          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] font-[600] text-[#404040]">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={registerForm.name}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, name: e.target.value })
              }
              className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1]"
              placeholder="관리자 이름"
            />
          </div>
        </div>

        <SubmitButton
          onClick={handleRegisterSubmit}
          disabled={isRegisterDisabled}
        >
          {isRegisterSubmitting ? "등록 중..." : "관리자 등록"}
        </SubmitButton>
      </section>

      <hr className="border-t border-[#D4D4D4]" />

      {/* 섹션 5: 등록된 관리자 목록 */}
      <section className="flex flex-col gap-[20px]">
        <h3 className="text-[20px] font-[700] text-[#404040]">
          등록된 관리자 목록
        </h3>

        {deleteError && <AlertMessage type="error" message={deleteError} />}
        {deleteSuccess && (
          <AlertMessage type="success" message={deleteSuccess} />
        )}

        {isLoadingAdmins ? (
          <p className="text-[14px] text-[#737373]">로딩 중...</p>
        ) : admins.length === 0 ? (
          <p className="text-[14px] text-[#737373]">등록된 관리자가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {admins.map((a: any) => {
              const isCurrentUser = admin && admin.username === a.username;
              const isDev = a.role === "dev";
              const canDelete = !isCurrentUser && !isDev;

              return (
                <div
                  key={a._id || a.id}
                  className="flex items-center justify-between p-[16px] bg-[#F5F5F5] rounded-[8px]"
                >
                  <div className="flex gap-[20px] text-[14px] items-center">
                    <span className="font-[600] text-[#404040]">
                      {a.username}
                    </span>
                    <span className="text-[#737373]">{a.name}</span>
                    <span
                      className={`text-[12px] px-[8px] py-[2px] rounded-[4px] font-[500] ${
                        isDev
                          ? "bg-[#FFF3E0] text-[#E65100]"
                          : "bg-[#F0F0F0] text-[#A3A3A3]"
                      }`}
                    >
                      {isDev ? "개발자" : "관리자"}
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    {isCurrentUser && (
                      <span className="text-[12px] text-[#0089D1] font-[600] bg-[#E6F3FA] px-[8px] py-[4px] rounded-[4px]">
                        현재 계정
                      </span>
                    )}
                    {isDev && (
                      <span className="text-[12px] text-[#E65100] font-[600] bg-[#FFF3E0] px-[8px] py-[4px] rounded-[4px]">
                        보호됨
                      </span>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="text-[12px] text-red-500 font-[600] bg-red-50 px-[10px] py-[4px] rounded-[4px] hover:bg-red-100 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[12px] p-[32px] max-w-[400px] w-full mx-[16px] shadow-xl">
            <h4 className="text-[18px] font-[700] text-[#404040] mb-[12px]">
              관리자 삭제 확인
            </h4>
            <p className="text-[14px] text-[#737373] mb-[24px]">
              <span className="font-[600] text-[#404040]">
                {deleteTarget.username}
              </span>{" "}
              ({deleteTarget.name}) 계정을 삭제하시겠습니까?
              <br />
              <span className="text-red-500 text-[13px]">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </p>
            <div className="flex gap-[12px] justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-[20px] py-[10px] rounded-[8px] text-[14px] font-[600] bg-[#F5F5F5] text-[#737373] hover:bg-[#E5E5E5] transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                className="px-[20px] py-[10px] rounded-[8px] text-[14px] font-[600] bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
