"use client";

import { useState, useEffect } from "react";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import NewTransactionForm from "./forms/NewTransactionForm";
import EditTransactionForm from "./forms/EditTransactionForm";
import ViewTransactionForm from "./forms/ViewTransactionForm";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
import Pagination from "../components/Pagination";

export default function Transactions() {
  const [modalMode, setModalMode] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [isEditing, setIsEditing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const serviceEndpoint = "http://127.0.0.1:8001/api/service-transactions/";
  const financeEndpoint = "http://127.0.0.1:8001/api/finance-transactions/";

  // Fetch both Service and Finance transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [serviceRes, financeRes] = await Promise.all([
          fetch(serviceEndpoint),
          fetch(financeEndpoint),
        ]);

        if (!serviceRes.ok || !financeRes.ok)
          throw new Error("Failed to fetch transactions");

        const [serviceData, financeData] = await Promise.all([
          serviceRes.json(),
          financeRes.json(),
        ]);

        // Add a "type" field to distinguish rows
        const combinedData = [
          ...serviceData.map((t) => ({ ...t, transaction_type: "Service" })),
          ...financeData.map((t) => ({ ...t, transaction_type: "Finance" })),
        ];

        setTransactions(combinedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) =>
    (t.user?.username || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const handleClose = () => {
    setIsOpen(false);
    setSelectedData(null);
    setModalMode(null);
    setIsEditing(false);
  };

  const openNew = () => {
    setModalMode("new");
    setIsOpen(true);
  };

  const openEdit = (entry) => {
    setSelectedData(entry);
    setModalMode("edit");
    setIsOpen(true);
  };

  const openEditFromView = (entry) => {
    setSelectedData(entry);
    setIsEditing(true);
    setIsOpen(true);
    setModalMode("view");
  };

  const openView = (entry) => {
    setSelectedData(entry);
    setModalMode("view");
    setIsEditing(false);
    setIsOpen(true);
  };

  const headers = [
    "ID",
    "Type",
    "User",
    "Service / Category",
    "Amount",
    "Date",
  ];

  const columns = [
    "id",
    "transaction_type",
    "user.username",
    "service_or_category",
    "amount",
    "date_created",
  ];

  // Map service or finance name dynamically
  const tableData = paginatedTransactions.map((t) => ({
    ...t,
    service_or_category: t.transaction_type === "Service"
      ? t.service?.name || "-"
      : t.category?.name || "-",
  }));

  return (
    <div>
      <HeaderWithNewButton
        title="All Transactions"
        buttonLabel="Add Transaction"
        onClick={openNew}
      />

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search transactions..."
      />

      {loading ? (
        <div style={{ padding: "1rem", textAlign: "center" }}>Loading...</div>
      ) : tableData.length > 0 ? (
        <StyledTable
          headers={headers}
          columns={columns}
          data={tableData}
          renderCell={(row, col) => {
            if (col === "amount") return <BalanceCell value={row[col]} />;
            if (col === "user.username" || col === "service_or_category") {
              const value = row[col] || "-";
              return <button onClick={() => openView(row)}>{value}</button>;
            }
            return row[col];
          }}
          getRowKey={(row) => `${row.transaction_type}-${row.id}`}
        />
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No transactions found.
        </div>
      )}

      {filteredTransactions.length > entriesPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          modalMode === "new"
            ? "Add New Transaction"
            : isEditing
            ? "Edit Transaction"
            : "Transaction Details"
        }
      >
        {modalMode === "new" && <NewTransactionForm onSubmit={() => {}} />}

        {modalMode === "view" && !isEditing && (
          <ViewTransactionForm
            data={selectedData}
            onEdit={() => openEditFromView(selectedData)}
            onClose={handleClose}
          />
        )}

        {modalMode === "view" && isEditing && (
          <EditTransactionForm
            existing={selectedData}
            onSubmit={() => {}}
          />
        )}

        {modalMode === "edit" && (
          <EditTransactionForm
            existing={selectedData}
            onSubmit={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}
