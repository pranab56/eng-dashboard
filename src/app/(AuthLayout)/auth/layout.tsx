import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="w-full max-w-[440px] mx-auto">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          {children}
        </div>
        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} ENG Sports. All rights reserved.
        </div>
      </div>
      <SonnerToaster position="top-right" richColors />
      <HotToaster position="top-right" reverseOrder={false} />
    </div>
  );
}
