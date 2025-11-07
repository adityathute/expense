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
    const isCleared = finance.isRecurring
      ? finance.status !== "planned"
      : true;

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
      is_cleared: isCleared,
      is_recurring: finance.isRecurring,
      description,
    };

    if (finance.isRecurring) {
      payload.recurring_frequency = finance.frequency || null;
      payload.next_due_date = finance.nextDueDate || null;
      payload.due_range_start = finance.dueRangeStart || null;
      payload.due_range_end = finance.dueRangeEnd || null;
      payload.status = finance.status || "planned";
      payload.last_payment_date =
        finance.status === "paid" ? finance.lastPaymentDate : null;
    }

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
      if (!finance.nextDueDate) return alert("Please select due date");
      payload.is_debt = true;
      payload.debt_type = finance.debtType;
      payload.interest_amount = Number(finance.splits[0]?.interest || 0);
      payload.due_date = finance.nextDueDate;
    }


    // 🟢 Add Loan-specific fields
    if (finance.selectedCore === "Loans") {
      payload.is_loan = true;
      payload.loan_id = finance.loanId || null;
      payload.party_name = finance.partyName || null;
      payload.loan_date = finance.loanDate || null;
      payload.principal_amount = Number(finance.principalAmount || 0);
      payload.interest_rate = Number(finance.interestRate || 0);
      payload.tenure = Number(finance.tenure || 0);
      payload.emi_amount = Number(finance.emiAmount || 0);
      payload.total_interest = Number(finance.interestAmount || 0);
      payload.total_payable = Number(finance.totalPayable || 0);
    }

    // 🧠 Debug: Log payload before sending
    console.log("📦 Loan Payload to be sent:", payload);

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
        isRecurring={finance.isRecurring}
        setIsRecurring={finance.setIsRecurring}
        frequency={finance.frequency}
        setFrequency={finance.setFrequency}
        nextDueDate={finance.nextDueDate}
        setNextDueDate={finance.setNextDueDate}
        dueRangeStart={finance.dueRangeStart}
        setDueRangeStart={finance.setDueRangeStart}
        dueRangeEnd={finance.dueRangeEnd}
        setDueRangeEnd={finance.setDueRangeEnd}
        status={finance.status}
        setStatus={finance.setStatus}
        lastPaymentDate={finance.lastPaymentDate}
        setLastPaymentDate={finance.setLastPaymentDate}
        groupId={finance.groupId}
        user={user}
        setUser={setUser}
        userOptions={userOptions}
        debtType={finance.debtType}
        setDebtType={finance.setDebtType}
        loanId={finance.loanId}
        setLoanId={finance.setLoanId}
        partyName={finance.partyName}
        setPartyName={finance.setPartyName}
        loanDate={finance.loanDate}
        setLoanDate={finance.setLoanDate}
        principalAmount={finance.principalAmount}
        setPrincipalAmount={finance.setPrincipalAmount}
        interestRate={finance.interestRate}
        setInterestRate={finance.setInterestRate}
        tenure={finance.tenure}
        setTenure={finance.setTenure}
        emiAmount={finance.emiAmount}
        setEmiAmount={finance.setEmiAmount}
        interestAmount={finance.interestAmount}
        setInterestAmount={finance.setInterestAmount}
        totalPayable={finance.totalPayable}
        setTotalPayable={finance.setTotalPayable}
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
