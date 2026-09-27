"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AdminGuard from "@/components/layout/AdminGuard";
import { HeadersProvider } from "@/hooks/useHeaders";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { cn } from "@/lib/utils";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop Persistent Sidebar (>= lg) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-[#0b0c10] border-r border-white/[0.08] transition-[width] duration-300 ease-in-out shrink-0 z-30 select-none",
          isCollapsed ? "w-[72px]" : "w-[264px]"
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop (< lg) */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Drawer (< lg) */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-[#0b0c10] z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out border-r border-white/[0.08] select-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar isMobile />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 z-20 shadow-2xs">
          <Header />
        </header>
        <main className="flex-1 bg-slate-100 overflow-y-auto custom-page-scroll">
          {children}
        </main>
        <HotToaster position="top-right" reverseOrder={false} />
        <SonnerToaster position="top-right" richColors />
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HeadersProvider>
      <AdminGuard>
        <SidebarProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
      </AdminGuard>
    </HeadersProvider>
  );
}
