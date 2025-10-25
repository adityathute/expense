"use client";
import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";
import ServiceForm from "./Forms/ServiceForm";
import FinanceForm from "./Forms/FinanceForm";
import useFinanceTransaction from "./hooks/useFinanceTransaction";

export default function NewTransactionForm({ onSubmit }) {
  const [type, setType] = useState("service");
  const [user, setUser] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  const finance = useFinanceTransaction();

  // Fetch services
  useEffect(() => {
    if (type !== "service") return;
    const fetchServices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/services/");
        const data = await res.json();
        setServiceOptions(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setServiceOptions([]);
      }
    };
    fetchServices();
  }, [type]);

  const availableCoreCategories = finance.coreCategories; // show all

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "service" && !selectedService) {
      return alert("Please select a service");
    }

    if (type === "finance") {
      // Only require leaf category if not Transfer
      if (!finance.selectedCore) {
        return alert("Please select a core category");
      }
      if (finance.selectedCore !== "Transfer" && !finance.selectedLeaf) {
        return alert("Please select a category");
      }
    }

    const isSplit = finance.splits.length > 1;
    const isCleared = finance.isRecurring
      ? finance.status === "planned"
        ? false
        : true
      : true; // non-recurring transactions are cleared immediately

    // ---------- BASE PAYLOAD ----------
    const payload = {
      user,
      amount: Number(finance.totalAmount),
      category: parseInt(finance.selectedLeaf, 10),
      is_split: isSplit,
      split_details: isSplit
        ? finance.splits.map(s => ({
          account_id: parseInt(s.account),
          amount: Number(s.amount) *
            (finance.selectedCategory?.core_category === "Expense" ? -1 : 1),
        }))
        : [],
      account: isSplit ? null : parseInt(finance.splits[0].account),
      is_cleared: isCleared,
      // VERY IMPORTANT — always send this explicitly
      is_recurring: finance.isRecurring,
    };

    // ✅ Only add recurring fields when recurring is ON
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

      // Remove irrelevant fields
      delete payload.account;
      delete payload.category;
      payload.is_split = false;
      payload.split_details = [];
    }

    const endpoint =
      type === "service"
        ? "http://127.0.0.1:8001/api/service-transactions/"
        : "http://127.0.0.1:8001/api/finance-transactions/";

    try {
      const res = await fetch(endpoint, {
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
      <label>Transaction Type</label>
      <select value={type} className={styles.modalFormInput} onChange={(e) => setType(e.target.value)}>
        <option value="service">Service</option>
        <option value="finance">Finance</option>
      </select>

      {type === "service" && (
        <ServiceForm
          serviceOptions={serviceOptions}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
        />
      )}

      {type === "finance" && (
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
        />
      )}

      <label style={{ marginTop: "0.25rem", display: "block" }}>Total Amount</label>
      <input type="number" value={finance.totalAmount.toString()} className={styles.modalFormInput} readOnly />

      <button type="submit" className={styles.buttonSubmit}>Save</button>
    </form>
  );
}
