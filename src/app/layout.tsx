import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "kitagawa 관리자 페이지",
  description: "kitagawa 홈페이지 및 제품 관리 페이지 입니다.",
  openGraph: {
    title: "Kitagawa 관리자 페이지",
    description: "Kitagawa 홈페이지 및 제품 관리 페이지 입니다.",
    url: "https://admin.kitagawa.co.kr",
    siteName: "Kitagawa Admin",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://storage.googleapis.com/kitagawa-cdn/banner/1763979224078-main1.jpg",
        width: 1200,
        height: 630,
        alt: "Kitagawa Admin",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${poppins.variable} antialiased`}
        style={{
          fontFamily: "var(--font-poppins), Arial, Helvetica, sans-serif",
        }}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
