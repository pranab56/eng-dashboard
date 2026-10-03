'use client';

import { persistor, store } from "@/utils/store";
import type { ReactNode } from 'react';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

interface ClientLayoutProps {
  children: ReactNode;
}

function AppSplashLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs tracking-wider">
            ENG
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
            ENG Sports Operations
          </span>
          <span className="text-[11px] text-slate-500 animate-pulse">
            Initializing console...
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<AppSplashLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
