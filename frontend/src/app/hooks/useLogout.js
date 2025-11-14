"use client";

import { useState } from "react";

export default function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setLoading(true);

    // remove cookie
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // refresh the app
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  };

  return { logout, loading };
}
