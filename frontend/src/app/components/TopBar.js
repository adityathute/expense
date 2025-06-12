// components/TopBar.js
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import "../styles/components/topbar.css";

export default function TopBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <header className="topbar-header">
      <nav className="topbar-nav">
        <div className="topbar-left">
          <button className="topbar-toggle-btn" onClick={onToggleSidebar}>
            {isSidebarOpen ? (
              <X size={28} className="toggle-icon close" />
            ) : (
              <Menu size={28} className="toggle-icon open" />
            )}
          </button>
          <span className="topbar-logo">Shivanya MS</span>
        </div>
        <div className="topbar-buttons">
          <Link href="/add-transactions">
            <button className="topbar-btn primary">Add</button>
          </Link>
          <Link href="/login">
            <button className="topbar-btn secondary">Login</button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
