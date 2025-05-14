"use client";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import "./page.css";

export default function Dashboard() {
  // Mock data – replace with real API calls later
  const income = 25000;
  const expense = 12000;
  const balance = income - expense;

  const recentTransactions = [
    { id: 1, name: "Groceries", amount: -1500, date: "2025-05-13" },
    { id: 2, name: "Salary", amount: 20000, date: "2025-05-10" },
    { id: 3, name: "Electricity Bill", amount: -2200, date: "2025-05-08" },
  ];

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Dashboard</h1>
          <p>Track your income, expenses, and balance.</p>

          <div className="balance-cards">
            <div className="card income">Income ₹{income}</div>
            <div className="card expense">Expense ₹{expense}</div>
            <div className="card balance">Balance ₹{balance}</div>
          </div>

          <div className="transactions">
            <h2>Recent Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td>{txn.name}</td>
                    <td className={txn.amount < 0 ? "negative" : "positive"}>
                      ₹{txn.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
