import { Toaster } from "sonner";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-white h-screen flex items-center justify-center">
      <div className="w-full max-w-[600px] mx-auto flex text-center justify-center py-8 px-2">
        <div className="bg-white px-2 sm:px-4 md:px-8 py-6 md:py-8 w-full customShadow2">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
