// report/page.js
"use client";
import { useState } from "react";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
// import "./reports.css";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("2025-05");

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

  const headers = ["Category", "Amount"];
  const columns = ["category", "amount"];

  return (
    <div className="reports">
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
            <p><BalanceCell value={summary.income} /></p>
          </div>
        </div>
        <div className="card expense">
          <span>🧾</span>
          <div>
            <h3>Expense</h3>
            <p><BalanceCell value={summary.expense} /></p>
          </div>
        </div>
        <div className="card balance">
          <span>📊</span>
          <div>
            <h3>Balance</h3>
            <p><BalanceCell value={summary.balance} /></p>
          </div>
        </div>
      </div>

      <div className="report-table">
        <h2>Category Breakdown</h2>
        <StyledTable
          headers={headers}
          columns={columns}
          data={categoryBreakdown}
          renderCell={(row, col) =>
            col === "amount" ? <BalanceCell value={row[col]} /> : row[col]
          }
        />
      </div>
    </div>
  );
}
