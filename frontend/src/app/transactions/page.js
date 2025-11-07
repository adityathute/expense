"use client";

import { useState, useEffect } from "react";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import NewFinanceTransactionForm from "./forms/NewFinanceTransactionForm";
import NewServiceTransactionForm from "./forms/NewServiceTransactionForm";
import EditTransactionForm from "./forms/EditTransactionForm";
import ViewTransactionForm from "./forms/ViewTransactionForm";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
import Pagination from "../components/Pagination";
import { Wallet } from "lucide-react";

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
  const [categoryMap, setCategoryMap] = useState({});

  const entriesPerPage = 10;

  const serviceEndpoint = "http://127.0.0.1:8001/api/service-transactions/";
  const financeEndpoint = "http://127.0.0.1:8001/api/finance-transactions/";
  const servicesApi = "http://127.0.0.1:8001/api/services/";
  const categoriesApi = "http://127.0.0.1:8001/api/categories/";

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
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
        ...(Array.isArray(serviceData) ? serviceData : serviceData.results || []),
        ...(Array.isArray(financeData) ? financeData : financeData.results || []),
      ].map((t) => ({
        ...t,
        transaction_type: t.service ? "Service" : "Finance",
      }))
        .sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

      setTransactions(combinedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services and categories
  const fetchServicesAndCategories = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch(servicesApi),
        fetch(categoriesApi),
      ]);

      if (!servicesRes.ok || !categoriesRes.ok) throw new Error("Failed to fetch mapping");

      const [servicesData, categoriesDataRaw] = await Promise.all([
        servicesRes.json(),
        categoriesRes.json(),
      ]);

      const servicesArray = Array.isArray(servicesData)
        ? servicesData
        : servicesData.results || [];
      setServices(servicesArray);

      const categoriesArray = Array.isArray(categoriesDataRaw)
        ? categoriesDataRaw
        : categoriesDataRaw.results || categoriesDataRaw.categories || [];
      setCategories(categoriesArray);

      // Build category map for hierarchy
      const map = {};
      categoriesArray.forEach((c) => {
        map[c.id] = c;
      });
      setCategoryMap(map);
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

  const openView = (entry) => {
    const fullEntry = {
      ...entry,
      service_name: entry.service_name || services.find(s => s.id === entry.service)?.name || "-",
      category_name: entry.category_name || getCategoryPath(entry.category) || "-",
      service_fee: entry.service_fee || entry.service?.fee || 0,
    };
    setSelectedData(fullEntry);
    setIsEditing(false);
    setModalMode("view");
    setIsOpen(true);
  };

  const openEditFromView = (entry) => {
    setSelectedData(entry);
    setIsEditing(true);
    setModalMode("view");
    setIsOpen(true);
  };

  const openEdit = (entry) => {
    setSelectedData(entry);
    setModalMode("edit");
    setIsOpen(true);
  };

  // Search filter
  const filteredTransactions = transactions.filter((t) =>
    (t.user_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  // Helper: get category full path
  const getCategoryPath = (catId) => {
    if (!catId) return "-";
    const path = [];
    let current = categoryMap[catId];

    if (!current) return "-";

    // Traverse parents
    while (current) {
      path.unshift(current.name);
      if (!current.parent) break;
      current = categoryMap[current.parent];
    }

    // Only prepend core_category if it's different from the main category name
    if (current?.core_category && current.core_category !== path[0]) {
      path.unshift(current.core_category);
    }

    return path.join(" > ");
  };

  const headers = ["TransID", "Type", "User", "Service / Category", "Amount", "Date"];
  const columns = ["global_id", "transaction_type", "user_name", "service_or_category", "amount", "date_created"];

  // Prepare table data with full hierarchy
  const tableData = paginatedTransactions.map((t) => {
    let name = "-";
    if (t.transaction_type === "Service") {
      name = t.service_name || services.find(s => s.id === t.service)?.name || "-";
    } else if (t.transaction_type === "Finance") {
      name = getCategoryPath(t.category) || "-";
    }
    return {
      ...t,
      service_or_category: name,
      service_or_category_id: t.transaction_type === "Service" ? t.service : t.category,
    };
  });

  const openNewService = () => {
    setModalMode("newService");
    setIsOpen(true);
  };

  const openNewFinance = () => {
    setModalMode("newFinance");
    setIsOpen(true);
  };

  return (
    <div>
      <HeaderWithNewButton
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Wallet size={22} color="#a26bfa" />
            <span>Transactions</span>
          </span>
        }
        buttons={[
          { label: "Service", onClick: openNewService },
          { label: "Finance", onClick: openNewFinance },
        ]}
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
              <button
                onClick={() => openView(row)}
                style={{
                  fontWeight: 600,
                  color: "#38bdf8",
                  background: "transparent",
                  outline: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: ".9rem",
                }}
              >
                {row.global_id}
              </button>
            );
            if (col === "user_name") {
              if (!row.user_name) return "-";
              const words = row.user_name.split(" ");
              if (words.length === 1) return words[0]; // Only one word
              return `${words[0]} ${words[words.length - 1]}`; // First + last
            }
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
          modalMode === "newFinance"
            ? "Add New Finance Transaction"
            : modalMode === "newService"
              ? "Add New Service Transaction"
              : isEditing
                ? "Edit Transaction"
                : "Transaction Details"
        }
      >
        {modalMode === "newFinance" && (
          <NewFinanceTransactionForm onSubmit={handleSaveNew} />
        )}
        {modalMode === "newService" && (
          <NewServiceTransactionForm onSubmit={handleSaveNew} />
        )}
        {modalMode === "view" && !isEditing && (
          <ViewTransactionForm
            data={selectedData}
            getName={(id, type) =>
              type === "Service"
                ? services.find((s) => s.id === id)?.name || id
                : getCategoryPath(id)
            }
            onEdit={() => openEditFromView(selectedData)}
            onClose={handleClose}
          />
        )}
        {modalMode === "edit" && (
          <EditTransactionForm existing={selectedData} onSubmit={() => { }} />
        )}
      </Modal>

    </div>
  );
}
