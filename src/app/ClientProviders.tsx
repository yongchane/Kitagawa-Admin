"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import LogoutWarningModal from "@/components/LogoutWarningModal";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider sessionTimeoutMinutes={2} warningTimeSeconds={60}>
      {children}
      <LogoutWarningModal />
    </AuthProvider>
  );
}
