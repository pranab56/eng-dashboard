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
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <section className="w-[280px] h-screen bg-[#080808] flex-shrink-0">
          <Sidebar />
        </section>
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <header className="h-20 flex-shrink-0 bg-white border-b border-gray-100">
            <Header />
          </header>
          <main className="flex-1 bg-gray-100 overflow-y-auto hide-scrollbar">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    </HeadersProvider>
  );
}
