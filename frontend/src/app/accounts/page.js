"use client";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useState, useEffect } from "react";
import "./style.css";

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
  const [editingId, setEditingId] = useState(null); // State for edit mode

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/accounts/")
      .then((res) => res.json())
      .then((data) => setBankAccounts(data))
      .catch((err) => console.error("Error fetching accounts:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function formatBalance(amount) {
    const parsed = parseFloat(amount);
    return parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toFixed(2);
  }

  function getBalanceClass(amount) {
    if (amount < 0) return "balance-negative";
    if (amount > 0) return "balance-positive";
    return "balance-zero";
  }

  const handleAddAccount = () => setShowForm(true);
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null); // Reset editing state when closing form
  };

  const handleFormSubmit = () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://127.0.0.1:8001/api/accounts/${editingId}/`
      : "http://127.0.0.1:8001/api/accounts/";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error saving account");
        return res.json();
      })
      .then((savedAccount) => {
        if (editingId) {
          // Replace edited item
          setBankAccounts((prev) =>
            prev.map((acc) => (acc.id === editingId ? savedAccount : acc))
          );
        } else {
          setBankAccounts((prev) => [...prev, savedAccount]);
        }

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

  const isCash = formData.account_mode === "Cash";
  const categoryTotals = bankAccounts.reduce((acc, account) => {
    const category = account.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + parseFloat(account.balance || 0);
    return acc;
  }, {});
  const totalBalance = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
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
                <p className="cat-card-special-block">₹ {formatBalance(total)}</p>
              </div>
            ))}
            {/* Total Balance Block */}
            <div className="category-card total-balance-block">
              <h3>Total Balance</h3>
              <div className="cat-card-special-block">
                <p>₹ {formatBalance(totalBalance)}</p>
              </div>
            </div>
          </div>


          <div className="bank-account-section">

            {showForm && (
              <>
                <h3>{editingId ? "Edit Account" : "Add New Account"}</h3>
                <div className="form">
                  {/* Account Mode on Top */}
                  <select
                    name="account_mode"
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
                      placeholder="Service Name"
                      value={formData.bank_service_name}
                      onChange={handleChange}
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        name="bank_service_name"
                        placeholder="Bank Name"
                        value={formData.bank_service_name}
                        onChange={handleChange}
                      />
                      <input
                        type="text"
                        name="account_holder_name"
                        placeholder="Account Holder Name"
                        value={formData.account_holder_name}
                        onChange={handleChange}
                      />
                    </>
                  )}

                  {!isCash && (
                    <>
                      <input
                        type="text"
                        name="account_number"
                        placeholder="Account Number"
                        value={formData.account_number}
                        onChange={handleChange}
                      />
                      <input
                        type="text"
                        name="ifsc_code"
                        placeholder="IFSC Code"
                        value={formData.ifsc_code}
                        onChange={handleChange}
                      />
                      <select
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                      >
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
                    name="balance"
                    placeholder="Initial Balance"
                    value={formData.balance}
                    onChange={handleChange}
                  />

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Home">Home</option>
                  </select>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={handleFormSubmit}>
                      {editingId ? "Update" : "Submit"}
                    </button>
                    <button onClick={handleCloseForm}>Close</button>
                  </div>
                </div>
              </>
            )}

            <div className="bank-account-list">
              <div className="create-new-account">
                <h3 className="create-new-account-h-block">Accounts</h3>
                {/* Add Account Button Block */}
                <div className="create-new-account-btn-block" onClick={handleAddAccount}>
                  <button className="cat-card-special-btn">+&nbsp;&nbsp;Create account</button>
                </div>
              </div>
              <table className="account-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Holder Name</th>
                    <th>Service/Bank</th>
                    <th>Balance</th>
                    <th>Mode</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {bankAccounts
                    .filter((acc) => !selectedCategory || acc.category === selectedCategory)
                    .map((account, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{account.account_holder_name || "-"}</td>
                        <td>{account.bank_service_name || "-"}</td>
                        <td className={getBalanceClass(account.balance)}>₹&nbsp;{formatBalance(account.balance)}</td>
                        <td>{account.account_mode}</td>
                        <td>{account.account_type || "-"}</td>
                        <td>{account.category}</td>
                        <td>
                          <button onClick={() => handleEdit(account)}>Edit</button>
                        </td>
                      </tr>
                    ))}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
