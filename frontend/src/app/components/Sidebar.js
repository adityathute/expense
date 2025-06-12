// components/Sidebar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/components/sidebar.css";
import {
  Home,
  Wallet,
  Banknote,
  ListTree,
  Server,
  Users,
  Store,
  LineChart,
  FileText,
  Settings,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose, sidebarRef }) {
  const pathname = usePathname();
  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={18} />, color: "#50b5ff" },
    { path: "/transactions", label: "Transactions", icon: <Wallet size={18} />, color: "#a26bfa" },
    { path: "/accounts", label: "Accounts", icon: <Banknote size={18} />, color: "#ffa94d" },
    { path: "/categories", label: "Categories", icon: <ListTree size={18} />, color: "#ff6b6b" },
    { path: "/services", label: "Services", icon: <Server size={18} />, color: "#63e6be" },
    { path: "/users", label: "Users", icon: <Users size={18} />, color: "#f783ac" },
    { path: "/shop-details", label: "Shop Details", icon: <Store size={18} />, color: "#91a7ff" },
    { path: "/analytics", label: "Analytics", icon: <LineChart size={18} />, color: "#f59f00" },
    { path: "/report", label: "Report", icon: <FileText size={18} />, color: "#94d82d" },
    { path: "/settings", label: "Settings", icon: <Settings size={18} />, color: "#ced4da" },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar-container ${isOpen ? "open" : ""}`}
    >
      <nav className="sidebar-nav">
        <ul className="sidebar-list">
          {navLinks.map(({ path, label, icon, color }, index) => {
            const isActive = pathname === path;
            return (
              <li
                key={path}
                className="sidebar-nav-item"
                onClick={onClose}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Link href={path} className={`sidebar-link ${isActive ? "active" : ""}`}>
                  <span className="sidebar-icon" style={{ color }}>{icon}</span>
                  <span className="sidebar-label">{label}</span>
                </Link>
              </li>
            );
          })}

        </ul>
      </nav>
    </aside>
  );
}
