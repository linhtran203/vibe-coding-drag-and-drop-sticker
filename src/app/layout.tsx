import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro"
});

export const metadata: Metadata = {
  title: "Drag and Drop App",
  description: "A drag and drop interface with resizable elements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${beVietnamPro.variable}`}>{children}</body>
    </html>
  );
}
