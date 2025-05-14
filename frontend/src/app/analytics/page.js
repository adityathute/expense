"use client";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./analytics.css";

export default function Analytics() {
  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content analytics">
          <h1>Analytics Dashboard</h1>
          <p className="sub-text">Track business trends and visualize financial insights.</p>

          <div className="stats-cards">
            <div className="card income">🟢 Income ₹25,000</div>
            <div className="card expense">🔴 Expense ₹12,000</div>
            <div className="card balance">🟡 Balance ₹13,000</div>
          </div>

          <div className="analytics-grid">
            <div className="chart-box">
              <h3>📊 Monthly Overview</h3>
              <div className="chart-placeholder">[Bar Chart Placeholder]</div>
            </div>
            <div className="chart-box">
              <h3>💡 Income vs Expense</h3>
              <div className="chart-placeholder">[Pie Chart Placeholder]</div>
            </div>
            <div className="chart-box full-width">
              <h3>📅 Weekly Trends</h3>
              <div className="chart-placeholder">[Line Chart Placeholder]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
