"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "../context/LoadingContext";

import useAuth from "../hooks/useAuth";
import { shouldHideLayout } from "../utils/layoutRules";

import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);

  const { showLoading, hideLoading } = useLoading();
  const isLoggedIn = useAuth();
  const [isMobile, setIsMobile] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // ⭐ GLOBAL LOADER ON PATH CHANGE
  useEffect(() => {
    showLoading();
    const timer = setTimeout(() => hideLoading(), 400);
    return () => clearTimeout(timer);
  }, [pathname, showLoading, hideLoading]);

  // Screen size check
  useEffect(() => {
    const updateScreen = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // ⭐ AUTH LOADER HANDLING
  useEffect(() => {
    if (isLoggedIn === null) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoggedIn, showLoading, hideLoading]);

  if (isMobile === null) return null;

  if (shouldHideLayout(pathname, isLoggedIn)) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      <div className="layout-body">
        <Sidebar
          isOpen={!isMobile || isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarRef={sidebarRef}
        />

        {isMobile && (
          <div
            className={`sidebar-blur-overlay ${isSidebarOpen ? "show" : ""
              }`}
          />
        )}

        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
