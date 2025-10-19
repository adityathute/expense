"use client";

import { useState } from "react";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import NewTransactionForm from "./forms/NewTransactionForm";
import EditTransactionForm from "./forms/EditTransactionForm";
import ViewTransactionForm from "./forms/ViewTransactionForm";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
import Pagination from "../components/Pagination";

export default function UidTransactions() {
  const [modalMode, setModalMode] = useState(null); // 'new' | 'edit' | 'view'
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [isEditing, setIsEditing] = useState(false);

  // Temporary sample data; replace with your API data
  const [transactions, setTransactions] = useState([
    { id: 1, name: "Alice", amount: -200, date: "2025-10-17" },
    { id: 2, name: "Bob", amount: 0, date: "2025-10-18" },
    { id: 3, name: "Aditya", amount: 450, date: "2025-10-19" },
  ]);

  // filteredTransactions calculation remains same
  const filteredTransactions = transactions.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = (entry) => {
    setTransactions((prev) => prev.filter((item) => item.id !== entry.id));
    console.log("Deleted:", entry);
  };

  const handleSaveNew = (data) => {
    const newId = transactions.length + 1;
    setTransactions([...transactions, { id: newId, ...data }]);
    handleClose();
  };

  const handleSaveEdit = (updatedData, closeModal = true) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === updatedData.id ? updatedData : item))
    );
    if (closeModal) {
      handleClose();
    }
  };


  const handleSearch = (e) => setSearchQuery(e.target.value);

  const headers = ["ID", "Name", "Amount", "Date"];
  const columns = ["id", "name", "amount", "date"];

  return (
    <div>
      <HeaderWithNewButton
        title="Transactions"
        buttonLabel="Add Transaction"
        onClick={openNew}
      />

      <SearchBar
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search transactions..."
      />

      {paginatedTransactions.length > 0 ? (
        <StyledTable
          headers={headers}
          columns={columns}
          data={paginatedTransactions}
          renderCell={(row, col) => {
            if (col === "amount") {
              return <BalanceCell value={row[col]} />;
            }
            if (col === "name") {
              return (
                <button
                  onClick={() => openView(row)}
                  aria-label={`View details of ${row.name}`}
                >
                  {row.name}
                </button>
              );
            }
            return row[col];
          }}
          getRowKey={(row) => row.id}
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
        title={isEditing ? "Edit Transaction" : "Transaction Details"}
      >
        {modalMode === "new" && <NewTransactionForm onSubmit={handleSaveNew} />}

        {/* When modal is open and mode is view, decide whether to show View or Edit */}
        {modalMode === "view" && !isEditing && (
          <ViewTransactionForm
            data={selectedData}
            onEdit={() => openEditFromView(selectedData)}
            onDelete={handleDelete}
            onClose={handleClose}
          />
        )}

        {modalMode === "view" && isEditing && (
          <EditTransactionForm
            existing={selectedData}
            onSubmit={(updatedData) => {
              handleSaveEdit(updatedData, false); // Don't close modal
              setIsEditing(false); // back to view
            }}
          />
        )}

        {modalMode === "edit" && (
          <EditTransactionForm
            existing={selectedData}
            onSubmit={(updatedData) => {
              handleSaveEdit(updatedData);
              handleClose();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
