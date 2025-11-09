"use client";

import React, { useEffect, useState } from "react";
import StyledTable from "../components/StyledTable";
import { CalendarClock } from "lucide-react";
import "../styles/components/table.css";

export default function Dashboard() {
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch upcoming payments
  const fetchUpcomingPayments = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/upcoming-payments/");
      const data = await response.json();

      // ✅ Filter payments where next_due_date is in the future
      const today = new Date();
      const upcoming = data
        .filter((item) => item.next_due_date && new Date(item.next_due_date) >= today)
        .sort(
          (a, b) =>
            new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
        );

      setUpcomingPayments(upcoming);
    } catch (error) {
      console.error("❌ Error fetching upcoming payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingPayments();
  }, []);

  const headers = ["Next Due Date", "Name", "Type", "Category", "Amount", "Frequency"];
  const columns = [
    "next_due_date",
    "name",
    "type",
    "category",
    "actual_amount",
    "frequency",
  ];

  function renderCell(row, column) {
    if (column === "actual_amount") {
      const value = row.actual_amount ?? row.estimated_amount ?? 0;
      return (
        <span
          style={{
            color: row.category === "income" ? "#6ecb63" : "#ff5e57",
            fontWeight: 600,
          }}
        >
          ₹{value}
        </span>
      );
    }
    if (column === "next_due_date") {
      return new Date(row.next_due_date).toLocaleDateString();
    }
    return row[column] ?? "-";
  }

  return (
    <div className="page-container">
      <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <CalendarClock size={24} color="#6ecb63" />
        Upcoming Payments
      </h1>
      <p style={{ color: "#aaa", marginBottom: "1rem" }}>
        Track all upcoming recurring payments and due dates.
      </p>

      {loading ? (
        <p>Loading upcoming payments...</p>
      ) : (
        <StyledTable
          headers={headers}
          columns={columns}
          data={upcomingPayments}
          renderCell={renderCell}
          emptyText="No upcoming payments scheduled."
          getRowKey={(row) => row.id}
        />
      )}
    </div>
  );
}
