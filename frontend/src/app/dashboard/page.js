// app/page.js
"use client";

import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";

export default function Dashboard() {
  const income = 25000;
  const expense = 12000;
  const balance = income - expense;

  const recentTransactions = [
    { id: 1, name: "Groceries", amount: -1500, date: "2025-05-13" },
    { id: 2, name: "Salary", amount: 20000, date: "2025-05-10" },
    { id: 3, name: "Electricity Bill", amount: -2200, date: "2025-05-08" },
  ];

  const headers = ["Date", "Name", "Amount"];
  const columns = ["date", "name", "amount"];

  function renderCell(row, column) {
    if (column === "amount") {
      return <BalanceCell value={row.amount} />;
    }
    return row[column];
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p>Track your income, expenses, and balance.</p>

      <div>
        <div>Income ₹{income}</div>
        <div>Expense ₹{expense}</div>
        <div>Balance ₹{balance}</div>
      </div>

      <div>
        <h2>Recent Transactions</h2>
        <StyledTable
          headers={headers}
          columns={columns}
          data={recentTransactions}
          renderCell={renderCell}
        />
      </div>
    </>
  );
}
