"use client";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useState } from "react";
import "../styles.css";

export default function Dashboard() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    ifscCode: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addBankAccount = () => {
    if (
      formData.accountHolder &&
      formData.accountNumber &&
      formData.bankName &&
      formData.ifscCode
    ) {
      setBankAccounts([...bankAccounts, formData]);
      setFormData({
        accountHolder: "",
        accountNumber: "",
        bankName: "",
        ifscCode: ""
      });
    }
  };

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Welcome to the Accounts</h1>
          <p>Manage your transactions, categories, and more.</p>

          <div className="bank-account-section">
            <h2>Add Bank Account (Use Client)</h2>
            <div className="form">
              <input
                type="text"
                name="accountHolder"
                placeholder="Account Holder Name"
                value={formData.accountHolder}
                onChange={handleChange}
              />
              <input
                type="text"
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                value={formData.bankName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="ifscCode"
                placeholder="IFSC Code"
                value={formData.ifscCode}
                onChange={handleChange}
              />
              <button onClick={addBankAccount}>Add Bank Account</button>
            </div>

            <div className="bank-account-list">
              <h3>Saved Bank Accounts</h3>
              <ul>
                {bankAccounts.map((account, index) => (
                  <li key={index}>
                    <strong>{account.accountHolder}</strong> - {account.bankName} ({account.accountNumber}) - IFSC: {account.ifscCode}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
