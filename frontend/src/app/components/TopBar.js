// components/TopBar.js
"use client";

import Link from "next/link";
import "../styles/components/topbar.css";

export default function TopBar() {
  return (
    <header className="topbar-wrapper">
      <nav className="topbar-container">
        <div className="topbar-brand">Shivanya Multiservices</div>
        <div className="topbar-actions">
          <Link href="/add-transactions">
            <button className="btn btn-primary">Add Transaction</button>
          </Link>
          <Link href="/login">
            <button className="btn btn-dark">Login</button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
