"use client";
import { useState, useEffect } from "react";
import StyledTable from "../components/StyledTable";
import BalanceCell from "../components/BalanceCell";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal"; // ✅ Import your Modal
import styles from "../styles/components/modalForm.module.css";
import "./accounts.css";
import DeleteAccountModal from "./DeleteAccountModal";

export default function Account() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: "",
    account_number: "",
    bank_service_name: "",
    ifsc_code: "",
    balance: 0,
    account_mode: "Cash",
    account_type: "",
    category: "Business",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/accounts/")
      .then((res) => res.json())
      .then(setBankAccounts)
      .catch((err) => console.error("Error fetching accounts:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAccount = () => {
    setFormData({
      account_holder_name: "",
      account_number: "",
      bank_service_name: "",
      ifsc_code: "",
      balance: 0,
      account_mode: "Cash",
      account_type: "",
      category: "Business",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://127.0.0.1:8001/api/accounts/${editingId}/`
      : "http://127.0.0.1:8001/api/accounts/";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error saving account");
        return res.json();
      })
      .then((savedAccount) => {
        setBankAccounts((prev) =>
          editingId
            ? prev.map((acc) => (acc.id === editingId ? savedAccount : acc))
            : [...prev, savedAccount]
        );
        setShowForm(false);
        setEditingId(null);
      })
      .catch((err) => alert(err.message));
  };

  const handleEdit = (account) => {
    setFormData({
      account_holder_name: account.account_holder_name || "",
      account_number: account.account_number || "",
      bank_service_name: account.bank_service_name || "",
      ifsc_code: account.ifsc_code || "",
      balance: account.balance || 0,
      account_mode: account.account_mode || "Cash",
      account_type: account.account_type || "",
      category: account.category || "Business",
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    fetch(`http://127.0.0.1:8001/api/accounts/${id}/`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete account");
        setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
        setShowForm(false);
        setEditingId(null);
      })
      .catch((err) => alert(err.message));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const isCash = formData.account_mode === "Cash";

  const categoryTotals = bankAccounts.reduce((acc, account) => {
    const category = account.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + parseFloat(account.balance || 0);
    return acc;
  }, {});

  const totalBalance = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const filteredAccounts = bankAccounts
    .filter((acc) => !selectedCategory || acc.category === selectedCategory)
    .filter((acc) =>
      acc.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredAccounts.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const columns = [
    { key: "index", label: "#" },
    { key: "account_holder_name", label: "Holder Name" },
    { key: "bank_service_name", label: "Service/Bank" },
    { key: "balance", label: "Balance" },
    { key: "account_mode", label: "Mode" },
    { key: "account_type", label: "Type" },
    { key: "category", label: "Category" },
  ];

  const tableData = paginatedAccounts.map((account, i) => ({
    ...account,
    index: startIndex + i + 1,
  }));

  return (
    <div className="main-content">
      <h1>Welcome to the Accounts</h1>

      <div className="category-grid">
        {Object.entries(categoryTotals).map(([category, total]) => (
          <div
            key={category}
            className={`category-card ${selectedCategory === category ? "selected" : ""
              }`}
            onClick={() =>
              setSelectedCategory(category === selectedCategory ? null : category)
            }
          >
            <h3>{category}</h3>
            <p
              className={`cat-card-special-block ${total > 0
                ? "balance-positive"
                : total === 0
                  ? "balance-zero"
                  : "balance-negative"
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

      <div className="bank-account-section">
        {/* Modal */}
        <Modal
          isOpen={showForm}
          onClose={handleCloseForm}
          title={editingId ? "Edit Account" : "Add New Account"}
        >
          <div className="form">
            <select
              name="account_mode"
              className={styles.modalFormInput}
              value={formData.account_mode}
              onChange={handleChange}
            >
              <option value="Cash">Cash</option>
              <option value="Online">Online</option>
            </select>

            {isCash ? (
              <input
                type="text"
                name="bank_service_name"
                className={styles.modalFormInput}
                placeholder="Service Name"
                value={formData.bank_service_name}
                onChange={handleChange}
              />
            ) : (
              <>
                <input
                  type="text"
                  name="bank_service_name"
                  className={styles.modalFormInput}
                  placeholder="Bank Name"
                  value={formData.bank_service_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="account_holder_name"
                  className={styles.modalFormInput}
                  placeholder="Account Holder Name"
                  value={formData.account_holder_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="account_number"
                  className={styles.modalFormInput}
                  placeholder="Account Number"
                  value={formData.account_number}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="ifsc_code"
                  className={styles.modalFormInput}
                  placeholder="IFSC Code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                />
                <select
                  name="account_type"
                  className={styles.modalFormInput}
                  value={formData.account_type}
                  onChange={handleChange}
                >
                  <option value="">Select Account Type</option>
                  <option value="Current">Current</option>
                  <option value="Saving">Saving</option>
                  <option value="Pigme">Pigme</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                  <option value="Digital Gold">Digital Gold</option>
                  <option value="Trading">Trading</option>
                </select>
              </>
            )}

            <input
              type="number"
              className={styles.modalFormInput}
              name="balance"
              placeholder="Initial Balance"
              value={formData.balance}
              onChange={handleChange}
              step="0.01"
            />

            <select name="category" value={formData.category} onChange={handleChange} className={styles.modalFormInput}>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
              <option value="Home">Home</option>
            </select>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {/* If creating a new account */}
              {!editingId && (
                <button
                  onClick={handleFormSubmit}
                  className={styles.buttonSubmit}
                >
                  Submit
                </button>
              )}

              {/* If editing an existing account */}
              {editingId && (
                <>
                  <button
                    onClick={handleFormSubmit}
                    className="service-edit-btn"
                  >
                    ✎ Update
                  </button>
                  <button
                    onClick={() => {
                      setAccountToDelete({
                        id: editingId,
                        name: formData.account_holder_name || formData.bank_service_name
                      });
                      setShowDeleteModal(true);
                    }}
                    className="service-delete-btn"
                  >
                    🗑 Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
        
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          accountId={accountToDelete?.id}
          accountName={accountToDelete?.name}
          onDelete={(id) => {
            fetch(`http://127.0.0.1:8001/api/accounts/${id}/`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ is_deleted: true }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Failed to move account to Recycle Bin");
                setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
                setShowForm(false);
                setEditingId(null);
                setShowDeleteModal(false);
                setAccountToDelete(null);
              })
              .catch((err) => alert(err.message));
          }}
        />

        <div className="bank-account-list">
          <HeaderWithNewButton
            title="Account"
            buttonLabel="Add Account"
            onClick={handleAddAccount}
          />

          <SearchBar
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search accounts..."
          />

          {tableData.length > 0 ? (
            <StyledTable
              headers={columns.map((col) => col.label)}
              columns={columns.map((col) => col.key)}
              data={tableData}
              onEdit={handleEdit}
              renderCell={(row, col) =>
                col === "balance" ? <BalanceCell value={parseFloat(row.balance)} /> : row[col] ?? "-"
              }
            />
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
              No accounts found.
            </div>
          )}

          {filteredAccounts.length > entriesPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
