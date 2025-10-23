"use client";
import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";
import ServiceForm from "./Forms/ServiceForm";
import FinanceForm from "./Forms/FinanceForm";
import useFinanceTransaction from "./hooks/useFinanceTransaction";

export default function NewTransactionForm({ onSubmit }) {
  const [type, setType] = useState("service");
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState(""); // total amount
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

  const availableCoreCategories = finance.coreCategories.filter(core => {
    const cats = finance.allCategories.filter(c => c.core_category === core);
    return cats.some(c => !cats.some(child => child.parent === c.id));
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (type === "service" && !selectedService) return alert("Please select a service");
    if (type === "finance" && (!finance.selectedCore || !finance.selectedLeaf))
      return alert("Please select a category");

    const isSplit = finance.splits.length > 1;
    let total = Number(finance.totalAmount);

    // For Expense, convert amount to negative
    if (finance.selectedCategory?.core_category === "Expense") {
      total = -Math.abs(total);
    }

    const payload = {
      user,
      amount: Number(finance.totalAmount),
      category: parseInt(finance.selectedLeaf, 10),
      is_split: isSplit,
      split_details: isSplit
        ? finance.splits.map(s => ({
          account_id: parseInt(s.account),
          amount: Number(s.amount) * (finance.selectedCategory?.core_category === "Expense" ? -1 : 1)
        }))
        : [],
      account: isSplit ? null : parseInt(finance.splits[0].account),
      is_recurring: finance.isRecurring,
      recurring_frequency: finance.frequency,
      next_due_date: finance.nextDueDate || null,
      status: "planned"
    };

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
        />
      )}

      <label style={{ marginTop: "0.25rem", display: "block" }}>Total Amount</label>
      <input type="number" value={finance.totalAmount.toString()} className={styles.modalFormInput} readOnly />

      <button type="submit" className={styles.buttonSubmit}>Save</button>
    </form>
  );
}
