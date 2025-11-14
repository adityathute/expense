"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const check = () => {
      const ok = document.cookie.includes("access_token=");
      setIsLoggedIn(ok);
    };

    
    check();
    window.addEventListener("storage", check);

    return () => window.removeEventListener("storage", check);
    setTimeout(check, 300);
  }, []);

  return isLoggedIn;
}
