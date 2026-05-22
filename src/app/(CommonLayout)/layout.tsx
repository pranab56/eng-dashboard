import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { HeadersProvider } from "@/hooks/useHeaders";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HeadersProvider>
      <div className="flex">
        <section className="w-[280px] bg-[#080808]">
          <Sidebar />
        </section>
        <div className="flex-1">
          <header className="h-20">
            <Header />
          </header>
          <main className="bg-gray-100 overflow-y-auto hide-scrollbar" style={{ height: "calc(100vh - 80px)" }}>
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    </HeadersProvider>
  );
}
