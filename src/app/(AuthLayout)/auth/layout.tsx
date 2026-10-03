import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans selection:bg-slate-900 selection:text-white">
      {children}
      <SonnerToaster position="top-right" richColors />
      <HotToaster position="top-right" reverseOrder={false} />
    </div>
  );
}
