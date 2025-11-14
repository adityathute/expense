"use client";

import Link from "next/link";
import { Menu, X, Plus, User, LogOut } from "lucide-react";
import "../styles/components/topbar.css";
import Image from "next/image";

import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";

export default function TopBar({ isSidebarOpen, onToggleSidebar }) {
  const isLoggedIn = useAuth();        // ✅ FIX — you forgot this line
  const { logout, loading } = useLogout();

  // Prevent flash before auth loaded
  if (isLoggedIn === null) {
    return null; // Global loader will show
  }

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

        <div className="topbar-buttons flex gap-2">

          {isLoggedIn && (
            <Link href="/add-transactions">
              <button className="topbar-btn primary flex items-center gap-1">
                <Plus size={16} />
                <span className="btn-text">Add</span>
              </button>
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="topbar-btn secondary flex flex-row items-center gap-1"
            >
              <LogOut size={16} />
              <span className="btn-text">Logout</span>
            </button>
          ) : (
            <Link href="/login">
              <button className="topbar-btn secondary flex flex-row items-center gap-1">
                <User size={16} />
                <span className="btn-text">Login</span>
              </button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
