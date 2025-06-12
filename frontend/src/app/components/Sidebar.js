// components/Sidebar.js
"use client";

import Link from "next/link";
import "../styles/components/sidebar.css";

export default function Sidebar({ isOpen, onClose, sidebarRef }) {
  return (
    <aside
      ref={sidebarRef}
      className={`sidebar-container ${isOpen ? "open" : ""}`}
    >
      <nav className="sidebar-nav">
        <ul className="sidebar-list">
          {[
            { path: "/", label: "Dashboard" },
            { path: "/transactions", label: "Transactions" },
            { path: "/accounts", label: "Accounts" },
            { path: "/categories", label: "Categories" },
            { path: "/services", label: "Services" },
            { path: "/users", label: "Users" },
            { path: "/shop-details", label: "Shop Details" },
            { path: "/analytics", label: "Analytics" },
            { path: "/report", label: "Report" },
            { path: "/settings", label: "Settings" },
          ].map(({ path, label }) => (
            <li key={path} className="sidebar-nav-item" onClick={onClose}>
              <Link href={path}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
