"use client";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import dynamic from "next/dynamic";
// import "./analytics.css";

// Dynamically import with SSR disabled
const ClientOnlyChart = dynamic(() => import("./ClientOnlyChart"), { ssr: false });

export default function Analytics() {
  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content analytics">
          <h1>Analytics</h1>
          <p className="sub-text">Track business trends and visualize financial insights.</p>

          <div className="stats-cards">
            <div className="card income">🟢 Income ₹25,000</div>
            <div className="card expense">🔴 Expense ₹12,000</div>
            <div className="card balance">🟡 Balance ₹13,000</div>
          </div>

          {/* Render client-only charts */}
          <ClientOnlyChart />
        </div>
      </div>
    </div>
  );
}
