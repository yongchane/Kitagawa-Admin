import Header from "../components/Header";
import NavMenu from "./components/NavMenu";
import AuthGuard from "@/components/AuthGuard";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="settings-layout">
        <header className="settings-header">
          <Header />
        </header>

        {<NavMenu />}
        <main className="settings-content w-full h-full p-[48px]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
