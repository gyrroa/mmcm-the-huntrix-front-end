"use client";

import { createContext, useContext, useRef } from "react";

type ScrollRefs = {
  propertySectionRef: React.RefObject<HTMLDivElement>;
};

const ScrollContext = createContext<ScrollRefs | null>(null);

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const propertySectionRef = useRef<HTMLDivElement>(null!);

  return (
    <ScrollContext.Provider value={{ propertySectionRef }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within ScrollProvider");
  }
  return context;
};
