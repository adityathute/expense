"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./reports.css";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("2025-05");

  // Mock data (Replace with real data/API)
  const summary = {
    income: 42000,
    expense: 28000,
    balance: 14000,
  };

  const categoryBreakdown = [
    { category: "Groceries", amount: 6000 },
    { category: "Rent", amount: 12000 },
    { category: "Utilities", amount: 4000 },
    { category: "Freelance", amount: -20000 },
    { category: "Salary", amount: -22000 },
  ];

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content reports">
          <div className="header">
            <div>
              <h1>Monthly Reports</h1>
              <p>View and analyze your financial activity.</p>
            </div>
            <div className="filter">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          <div className="summary-cards">
            <div className="card income">
              <span>💰</span>
              <div>
                <h3>Income</h3>
                <p>₹{summary.income}</p>
              </div>
            </div>
            <div className="card expense">
              <span>🧾</span>
              <div>
                <h3>Expense</h3>
                <p>₹{summary.expense}</p>
              </div>
            </div>
            <div className="card balance">
              <span>📊</span>
              <div>
                <h3>Balance</h3>
                <p>₹{summary.balance}</p>
              </div>
            </div>
          </div>

          <div className="report-table">
            <h2>Category Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td className={item.amount < 0 ? "positive" : "negative"}>
                      ₹{Math.abs(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Future: Export, chart buttons */}
        </div>
      </div>
    </div>
  );
}
