"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(true); // ⭐ start TRUE for initial page load

  // Hide after first mount (SSR → CSR)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        loading,
        showLoading: () => setLoading(true),
        hideLoading: () => setLoading(false),
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
