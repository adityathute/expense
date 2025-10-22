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
  const [isEditing, setIsEditing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const entriesPerPage = 10;
  const serviceEndpoint = "http://127.0.0.1:8001/api/service-transactions/";
  const financeEndpoint = "http://127.0.0.1:8001/api/finance-transactions/";
  const servicesApi = "http://127.0.0.1:8001/api/services/";
  const categoriesApi = "http://127.0.0.1:8001/api/categories/";

  // Fetch transactions
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

      const combinedData = [
        ...serviceData.map((t) => ({ ...t, transaction_type: "Service" })),
        ...financeData.map((t) => ({ ...t, transaction_type: "Finance" })),
      ].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

      setTransactions(combinedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services and categories for mapping ID → Name
  const fetchServicesAndCategories = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch(servicesApi),
        fetch(categoriesApi),
      ]);
      if (!servicesRes.ok || !categoriesRes.ok) throw new Error("Failed to fetch mapping");
      const [servicesData, categoriesData] = await Promise.all([
        servicesRes.json(),
        categoriesRes.json(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchServicesAndCategories();
  }, []);

  const handleSaveNew = async () => {
    await fetchTransactions();
    handleClose();
  };

  const filteredTransactions = transactions.filter((t) =>
    (t.user?.username || "").toLowerCase().includes(searchQuery.toLowerCase())
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

  const openEditFromView = (entry) => {
    setSelectedData(entry);
    setIsEditing(true);
    setModalMode("view");
    setIsOpen(true);
  };

  const openView = (entry) => {
    const fullEntry = {
      ...entry,
      service_fee: entry.service_fee || entry.service?.fee || 0, // fallback if needed
      service_name: entry.service_name || getName(entry.service, "Service"),
      category_name: entry.category_name || getName(entry.category, "Finance"),
    };
    setSelectedData(fullEntry);
    setIsEditing(false);
    setModalMode("view");
    setIsOpen(true);
  };

  const openEdit = (entry) => {
    setSelectedData(entry);
    setModalMode("edit");
    setIsOpen(true);
  };

  // Ensure services/categories are arrays
  const getName = (id, type) => {
    if (!id) return "-";
    if (!Array.isArray(services)) return id;
    if (!Array.isArray(categories)) return id;

    if (type === "Service") return services.find((s) => s.id === id)?.name || id;
    return categories.find((c) => c.id === id)?.name || id;
  };

  const headers = ["TransID", "Type", "User", "Service / Category", "Amount", "Date"];
  const columns = ["global_id", "transaction_type", "user.username", "service_or_category", "amount", "date_created"];

  const tableData = paginatedTransactions.map((t) => ({
    ...t,
    service_or_category: t.transaction_type === "Service" ? t.service_name : t.category_name,
    service_or_category_id: t.transaction_type === "Service" ? t.service : t.category_id,
    service_fee: t.service_fee,
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
            if (col === "global_id") return (
              <button onClick={() => openView(row)} style={{ fontWeight: 600, color: "#38bdf8", background: "transparent", outline: "none", border: "none", cursor: "pointer", fontSize: ".9rem" }}>
                {row.global_id}
              </button>
            );
            if (col === "user.username") return row.user?.username || "-";
            if (col === "service_or_category") return row.service_or_category || "-";
            if (col === "date_created") return new Date(row.date_created).toLocaleDateString("en-GB");
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
        {modalMode === "new" && <NewTransactionForm onSubmit={handleSaveNew} />}
        {modalMode === "view" && !isEditing && (
          <ViewTransactionForm
            data={selectedData}
            getName={getName}
            onEdit={() => openEditFromView(selectedData)}
            onClose={handleClose}
          />
        )}
        {modalMode === "view" && isEditing && (
          <EditTransactionForm existing={selectedData} onSubmit={() => { }} />
        )}
        {modalMode === "edit" && (
          <EditTransactionForm existing={selectedData} onSubmit={() => { }} />
        )}
      </Modal>
    </div>
  );
}
