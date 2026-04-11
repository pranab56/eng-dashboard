"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type HeadersType = {
  title: string;
  des: string;
};

type HeadersContextType = {
  headers: HeadersType;
  setHeaders: React.Dispatch<React.SetStateAction<HeadersType>>;
};

const initialHeaders: HeadersType = {
  title: "Dashboard Overview",
  des: "Welcome back, Alexander! Here's an update on your luxury estate portfolio.",
};

// ---------------------------------- Create the headers context ---------------------------------- //
const HeadersContext = createContext<HeadersContextType | null>(null);

// ---------- Headers Provider component to wrap the app and provide the headers context ---------- //
export const HeadersProvider = ({ children }: { children: ReactNode }) => {
  const [headers, setHeaders] = useState<HeadersType>(initialHeaders);

  return (
    <HeadersContext.Provider value={{ headers, setHeaders }}>
      {children}
    </HeadersContext.Provider>
  );
};

// ----------------------------- Custom hook to use the HeadersContext ----------------------------- //
export const useHeaders = () => {
  const context = useContext(HeadersContext);

  if (!context) {
    throw new Error("useHeaders must be used within HeadersProvider");
  }

  return context;
};