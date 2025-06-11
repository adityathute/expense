// components/Sidebar.js
"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link href="/">Dashboard</Link></li>
        <li><Link href="/transactions">Transactions</Link></li>
        <li><Link href="/accounts">Accounts</Link></li>
        <li><Link href="/categories">Categories</Link></li>
        <li><Link href="/services">Services</Link></li>
        <li><Link href="/users">Users</Link></li>
        <li><Link href="/shop-details">Shop Details</Link></li>
        <li><Link href="/analytics">Analytics</Link></li>
        <li><Link href="/report">Report</Link></li>
        <li><Link href="/settings">Settings</Link></li>
      </ul>
    </div>
  );
}
