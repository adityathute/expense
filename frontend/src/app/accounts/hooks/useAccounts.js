"use client";

import { useState, useEffect } from "react";

export default function useAccounts(entriesPerPage = 10) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch accounts
  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/accounts/")
      .then((res) => res.json())
      .then(setBankAccounts)
      .catch((err) => console.error("Error fetching accounts:", err));
  }, []);

  const filteredAccounts = bankAccounts
    .filter((acc) => !selectedCategory || acc.category === selectedCategory)
    .filter((acc) =>
      (acc.account_holder_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredAccounts.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const categoryTotals = bankAccounts.reduce((acc, account) => {
    const category = account.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + parseFloat(account.balance || 0);
    return acc;
  }, {});
  const totalBalance = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Add or Update Account
  const addOrUpdateAccount = async (data, id, action) => {
    if (action === "delete") {
      setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
      return;
    }

    const url = id
      ? `http://127.0.0.1:8001/api/accounts/${id}/`
      : "http://127.0.0.1:8001/api/accounts/";

    // Clean payload based on account_mode
    const payload = { ...data };

    if (payload.account_mode !== "Investments") {
      delete payload.sub_account_type;
      delete payload.issue_date;
    }

    // Remove empty strings
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === "-") delete payload[key];
    });

    const method = id ? "PATCH" : "POST"; // PATCH for edit, POST for create

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const saved = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(saved));

    setBankAccounts((prev) =>
      id ? prev.map((a) => (a.id === id ? saved : a)) : [...prev, saved]
    );
  };

  // Delete Account (soft delete)
  const deleteAccount = async (id) => {
    const res = await fetch(`http://127.0.0.1:8001/api/accounts/${id}/`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete account");
    setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  return {
    bankAccounts,
    setBankAccounts,
    filteredAccounts,
    paginatedAccounts,
    categoryTotals,
    totalBalance,
    totalPages,
    startIndex,
    currentPage,
    setCurrentPage,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    addOrUpdateAccount,
    deleteAccount,
  };
}
