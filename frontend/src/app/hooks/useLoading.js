"use client";
import { useState } from "react";

export default function useLoading() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    showLoading: () => setLoading(true),
    hideLoading: () => setLoading(false),
  };
}
