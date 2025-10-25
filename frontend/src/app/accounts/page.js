"use client";
import React, { useState, useEffect } from "react";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import AccountFormModal from "./AccountFormModal";
import DeleteAccountModal from "./DeleteAccountModal";
import useAccounts from "../accounts/hooks/useAccounts";
import "./accounts.css";

export default function AccountPage() {
  const {
    bankAccounts,
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
  } = useAccounts(10);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const handleAdd = () => {
    setFormData({
      account_holder_name: "",
      account_number: "",
      bank_service_name: "",
      ifsc_code: "",
      balance: 0,
      account_mode: "Cash",
      category: "Business",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setFormData({ ...account });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    addOrUpdateAccount(formData, editingId)
      .then(() => {
        setShowForm(false);
        setEditingId(null);
      })
      .catch((err) => alert(err.message));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8001/api/accounts/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_deleted: true }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to move account to Recycle Bin");

        // Update table & close modals
        setShowDeleteModal(false);
        setAccountToDelete(null);
        setShowForm(false);
        setEditingId(null);
        addOrUpdateAccount(null, id, "delete");
      })
      .catch((err) => alert(err.message));
  };

  const columns = [
    { key: "index", label: "#" },
    { key: "account_holder_name", label: "Holder Name" },
    { key: "bank_service_name", label: "Service/Bank" },
    { key: "balance", label: "Balance" },
    { key: "account_mode", label: "Mode" },
    { key: "category", label: "Category" },
  ];

  const tableData = paginatedAccounts.map((acc, i) => ({
    ...acc,
    index: startIndex + i + 1,
  }));

  return (
    <div className="main-content">
      <h1>Welcome to the Accounts</h1>

      <div className="category-grid">
        {Object.entries(categoryTotals).map(([category, total]) => (
          <div
            key={category}
            className={`category-card ${selectedCategory === category ? "selected" : ""}`}
            onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
          >
            <h3>{category}</h3>
            <p
              className={`cat-card-special-block ${total > 0 ? "balance-positive" : total === 0 ? "balance-zero" : "balance-negative"
                }`}
            >
              ₹ {total.toFixed(2)}
            </p>
          </div>
        ))}
        <div className="category-card total-balance-block">
          <h3>Total Balance</h3>
          <div className="cat-card-special-block">₹ {totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <HeaderWithNewButton title="Account" buttonLabel="Add Account" onClick={handleAdd} />

      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search accounts..."
      />

      {tableData.length > 0 ? (
        <StyledTable
          headers={columns.map((c) => c.label)}
          columns={columns.map((c) => c.key)}
          data={tableData}
          onEdit={handleEdit}
          renderCell={(row, col) => (col === "balance" ? <BalanceCell value={parseFloat(row.balance)} /> : row[col] ?? "-")}
        />
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>No accounts found.</div>
      )}

      {filteredAccounts.length > 10 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <AccountFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        editingId={editingId}
        onDelete={() => {
          setAccountToDelete({
            id: editingId,
            name: formData.account_holder_name || formData.bank_service_name,
          });
          setShowDeleteModal(true);
        }}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        accountId={accountToDelete?.id}
        accountName={accountToDelete?.name}
        onDelete={handleDelete}
      />
    </div>
  );
}
