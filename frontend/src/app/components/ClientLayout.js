// components/ClientLayout.js
"use client";

import { useEffect, useState, useRef } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(null); // <-- initially null
  const sidebarRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // ensure it's closed on mobile
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Wait for device check to complete before rendering
  if (isMobile === null) return null;

  return (
    <div className="app-shell">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="layout-body">
        <Sidebar
          isOpen={!isMobile || isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sidebarRef={sidebarRef}
        />
        {isMobile && (
          <div
            className={`sidebar-blur-overlay ${isSidebarOpen ? "show" : ""}`}
          ></div>
        )}
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
