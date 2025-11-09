"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";
import FinanceForm from "./Forms/FinanceForm";
import useFinanceTransaction from "./hooks/useFinanceTransaction";

export default function NewFinanceTransactionForm({ onSubmit }) {
  const [user, setUser] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [description, setDescription] = useState("");
  const finance = useFinanceTransaction();
  const { allCategories, selectedCategory } = finance;

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/users/");
        const data = await res.json();
        setUserOptions(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUserOptions([]);
      }
    };
    fetchUsers();
  }, []);

  const availableCoreCategories = finance.coreCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!finance.selectedCore) return alert("Please select a core category");

    const requireLeafFor = ["Income", "Expense"];
    if (requireLeafFor.includes(finance.selectedCore) && !finance.selectedLeaf)
      return alert("Please select a category");

    const isSplit = finance.splits.length > 1;

    let categoryToUse = selectedCategory?.id;

    if (!categoryToUse) {
      const autoCategory = allCategories.find(
        (c) => c.core_category === finance.selectedCore && c.is_core
      );
      categoryToUse = autoCategory?.id || null;
    }

    const payload = {
      user: user || null,
      amount: Number(finance.totalAmount),
      category: categoryToUse,
      is_split: isSplit,
      split_details: isSplit
        ? finance.splits.map((s) => ({
          account_id: parseInt(s.account),
          amount:
            Number(s.amount) *
            (finance.selectedCategory?.core_category === "Expense" ? -1 : 1),
        }))
        : [],
      account: isSplit ? null : parseInt(finance.splits[0].account),
      description,
    };

    if (finance.isTransfer) {
      const fromAccountId = parseInt(finance.splits[0]?.account);
      const toAccountId = parseInt(finance.splits[1]?.account);
      const amount = Number(finance.totalAmount);
      payload.is_transfer = true;
      payload.from_account = fromAccountId;
      payload.to_account = toAccountId;
      payload.amount = amount;

      const transferCategory = allCategories.find(
        (c) => c.core_category === "Transfer" && c.is_core
      );
      payload.category = transferCategory?.id || null;

      delete payload.account;
      payload.is_split = false;
      payload.split_details = [];
    }

    if (finance.selectedCore === "Debts") {
      if (!finance.debtType) return alert("Please select debt type");
      if (!finance.dueDate) return alert("Please select due date");
      payload.is_debt = true;
      payload.debt_type = finance.debtType;
      payload.interest_amount = Number(finance.splits[0]?.interest || 0);
      payload.due_date = finance.dueDate;
    }

    try {
      const res = await fetch("http://127.0.0.1:8001/api/finance-transactions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      onSubmit();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      <FinanceForm
        categoryType={finance.categoryType}
        setCategoryType={finance.setCategoryType}
        selectedCore={finance.selectedCore}
        setSelectedCore={finance.setSelectedCore}
        availableCoreCategories={availableCoreCategories}
        categories={finance.categories}
        selectedLeaf={finance.selectedLeaf}
        onLeafChange={finance.handleLeafChange}
        selectedCategory={finance.selectedCategory}
        accounts={finance.accounts}
        splits={finance.splits}
        addSplitRow={finance.addSplitRow}
        updateSplitRow={finance.updateSplitRow}
        removeSplitRow={finance.removeSplitRow}
        getTotalSplitAmount={finance.getTotalSplitAmount}
        user={user}
        setUser={setUser}
        userOptions={userOptions}
        debtType={finance.debtType}
        setDebtType={finance.setDebtType}
        dueDate={finance.dueDate}
        setDueDate={finance.setDueDate}
      />

      <label style={{ marginTop: "0.75rem", display: "block" }}>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.modalFormInput}
        placeholder="Enter description..."
        rows={3}
      />

      <label>Total Amount</label>
      <input
        type="number"
        value={finance.totalAmount.toString()}
        className={styles.modalFormInput}
        readOnly
      />

      <button type="submit" className={styles.buttonSubmit}>
        Save
      </button>
    </form>
  );
}
