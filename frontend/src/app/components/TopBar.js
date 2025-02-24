"use client";

import Link from "next/link";

export default function TopBar() {
  return (
    <div className="topbarOuter">
      <div className="topbar">
        <div className="leftTopbar">Shivanya Multiservices</div>
        <div className="rightTopbar">
        <Link href="/add-transactions"><button className="btn btn-primary">Add Transaction</button></Link>
        <Link href="/login"><button className="btn btn-dark">Login</button></Link>
        </div>
      </div>
    </div>
  );
}
