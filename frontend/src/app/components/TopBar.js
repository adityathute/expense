// components/TopBar.js
"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import "../styles/components/topbar.css";
import Image from "next/image";

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
          <Link href="/" className="topbar-logo">
            <div className="topbar-logo-image">
              <Image
                src="/assets/logo.png"
                alt="Shivanya Logo"
                width={48}
                height={48}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="topbar-logo-text">Shivanya</span>
          </Link>
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
