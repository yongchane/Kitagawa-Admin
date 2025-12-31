"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authAPI } from "@/api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  timeUntilLogout: number | null;
  resetActivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  sessionTimeoutMinutes?: number;
  warningTimeSeconds?: number;
}

export function AuthProvider({
  children,
  sessionTimeoutMinutes = 60,
  warningTimeSeconds = 60,
}: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeUntilLogout, setTimeUntilLogout] = useState<number | null>(null);

  // useRef로 타이머 관리 (상태 변경으로 인한 리렌더링 방지)
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 자동 로그아웃 실행
  const performLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setTimeUntilLogout(null);
    console.log("자동 로그아웃 처리 완료");
    // 모든 타이머 정리
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // 로그인 페이지로 리다이렉트
    if (pathname !== "/login") {
      router.push("/login");
    }
  };

  // 활동 타이머 리셋
  const resetActivityTimer = () => {
    // 기존 타이머 모두 정리
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // 경고 상태 초기화
    setTimeUntilLogout(null);

    // 새로운 타이머 설정
    const sessionTimeoutMs = sessionTimeoutMinutes * 60 * 1000;
    const warningTimeMs = warningTimeSeconds * 1000;
    const warningStartTime = sessionTimeoutMs - warningTimeMs;

    // 세션 타임아웃 타이머
    activityTimerRef.current = setTimeout(() => {
      performLogout();
    }, sessionTimeoutMs);

    // 경고 시작 타이머
    warningTimerRef.current = setTimeout(() => {
      let remainingSeconds = warningTimeSeconds;
      setTimeUntilLogout(remainingSeconds);

      // 카운트다운 타이머
      countdownTimerRef.current = setInterval(() => {
        remainingSeconds -= 1;
        setTimeUntilLogout(remainingSeconds);

        if (remainingSeconds <= 0) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
        }
      }, 1000);
    }, warningStartTime);
  };

  // 초기 인증 상태 확인 및 이벤트 리스너 등록
  useEffect(() => {
    // 로그인 페이지에서는 처리하지 않음
    if (pathname === "/login") {
      setIsAuthenticated(false);
      return;
    }

    // 인증 상태 확인
    const authenticated = authAPI.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      router.push("/login");
      return;
    }

    // 인증된 경우 타이머 시작
    resetActivityTimer();

    // 사용자 활동 이벤트 핸들러
    const handleActivity = () => {
      if (authAPI.isAuthenticated()) {
        resetActivityTimer();
      }
    };

    // 이벤트 리스너 등록
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // 클린업
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [pathname]); // pathname만 의존성으로 추가

  // 토큰 만료 주기적 체크
  useEffect(() => {
    if (pathname === "/login") {
      return;
    }

    const checkTokenExpiry = setInterval(() => {
      if (authAPI.isTokenExpired()) {
        performLogout();
      }
    }, 10000); // 10초마다 체크

    return () => clearInterval(checkTokenExpiry);
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, timeUntilLogout, resetActivityTimer }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
