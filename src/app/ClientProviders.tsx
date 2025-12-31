"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import LogoutWarningModal from "@/components/LogoutWarningModal";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider sessionTimeoutMinutes={60} warningTimeSeconds={300}>
      {children}
      <LogoutWarningModal />
    </AuthProvider>
  );
}
