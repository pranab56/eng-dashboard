'use client';

import { persistor, store } from "@/utils/store";
import type { ReactNode } from 'react';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}