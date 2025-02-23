"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link href="/transactions">Dashboard</Link></li>
        <li><Link href="/transactions">Transactions</Link></li>
        <li><Link href="/accounts">Accounts</Link></li>
        <li><Link href="/categories">Categories</Link></li>
        <li><Link href="/users">Users</Link></li>
        <li><Link href="/assets">Assets</Link></li>
        <li><Link href="/analytics">Analytics</Link></li>
        <li><Link href="/report">Report</Link></li>
        <li><Link href="/settings">Settings</Link></li>
        <li><Link href="/settings">Help</Link></li>
      </ul>
    </div>
  );
}
