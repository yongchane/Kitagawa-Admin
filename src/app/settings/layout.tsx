import Header from "../components/Header";
import NavMenu from "./components/NavMenu";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="settings-layout">
      <header className="settings-header">
        <Header />
      </header>
      <div className="w-full px-[48px] pt-[48px] pb-[16px]">
        <h1 className="text-[40px] text-[#004B73] font-bold">Admin Page</h1>
      </div>
      <NavMenu />
      <main className="settings-content w-full h-full p-[48px]">
        {children}
      </main>
    </div>
  );
}
