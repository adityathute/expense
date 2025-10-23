"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";
import ServiceForm from "./Forms/ServiceForm";
import FinanceForm from "./Forms/FinanceForm";

export default function NewTransactionForm({ onSubmit }) {
  const [type, setType] = useState("service");
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState(""); // total amount

  // Services
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  // Finance
  const [categoryType, setCategoryType] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coreCategories] = useState(["Income", "Expense", "Money", "Debt", "Invest", "Saving"]);
  const [selectedCore, setSelectedCore] = useState("");
  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // Split payment state
  const [splits, setSplits] = useState([{ account: "", amount: "" }]);

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

  // Fetch categories
  useEffect(() => {
    if (type !== "finance") return;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
        const data = await res.json();
        const allCats = data.categories || [];
        setAllCategories(allCats);

        if (selectedCore) {
          const filteredByCore = allCats.filter(cat => cat.core_category === selectedCore);
          const buildTree = (items, parentId = null) =>
            items.filter(i => i.parent === parentId).map(i => ({ ...i, children: buildTree(items, i.id) }));
          setCategories(buildTree(filteredByCore));
          setSelectedLeaf("");
          setSelectedCategory(null);
        } else {
          setCategories([]);
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [type, categoryType, selectedCore]);

  // Fetch accounts
  useEffect(() => {
    if (type !== "finance") return;
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/accounts/");
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, [type]);

  const availableCoreCategories = coreCategories.filter(core => {
    const cats = allCategories.filter(c => c.core_category === core);
    return cats.some(c => !cats.some(child => child.parent === c.id));
  });

  const handleLeafChange = (e) => {
    const leafId = e.target.value;
    setSelectedLeaf(leafId);
    const catObj = allCategories.find(c => String(c.id) === String(leafId)) || null;
    setSelectedCategory(catObj);
  };

  // Split helpers
  const addSplitRow = () => setSplits([...splits, { account: "", amount: "" }]);

// Update split row
const updateSplitRow = (index, field, value) => {
  const newSplits = [...splits];

  if (field === "amount") {
    // Remove non-digit characters except dot
    let sanitized = value.replace(/[^0-9.]/g, "");
    // Prevent multiple dots
    const parts = sanitized.split(".");
    if (parts.length > 2) sanitized = parts[0] + "." + parts[1];

    newSplits[index][field] = sanitized;
  } else {
    newSplits[index][field] = value;
  }

  setSplits(newSplits);
};

// Remove split row
const removeSplitRow = (index) => {
  const newSplits = splits.filter((_, i) => i !== index);
  setSplits(newSplits); // only update splits
};

// Auto-calculate total whenever splits change
useEffect(() => {
  const total = splits.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  setAmount(total);
}, [splits]);

  const getTotalSplitAmount = () => splits.reduce((total, s) => total + Number(s.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (type === "service" && !selectedService) {
      alert("Please select a service");
      return;
    }
    if (type === "finance" && (!selectedCore || !selectedLeaf)) {
      alert("Please select a category");
      return;
    }

    let isSplit = splits.length > 1;
    let payload = {};

    if (type === "service") {
      payload = { user, amount: Number(amount), service: selectedService };
    } else {
      payload = {
        user,
        amount: Number(amount),
        category: parseInt(selectedLeaf, 10),
        is_split: isSplit
      };

      if (isSplit) {
        payload.split_details = splits.map(s => ({
          account_id: parseInt(s.account),
          amount: Number(s.amount)
        }));
        payload.account = null; // no default account
      } else {
        payload.account = parseInt(splits[0].account); // single account
        payload.split_details = []; // clear split details
      }
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
      <select
        value={type}
        className={styles.modalFormInput}
        onChange={(e) => setType(e.target.value)}
      >
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
          categoryType={categoryType}
          setCategoryType={setCategoryType}
          selectedCore={selectedCore}
          setSelectedCore={setSelectedCore}
          availableCoreCategories={availableCoreCategories}
          categories={categories}
          selectedLeaf={selectedLeaf}
          onLeafChange={handleLeafChange}
          selectedCategory={selectedCategory}
          accounts={accounts}

          // Split props
          splits={splits}
          addSplitRow={addSplitRow}
          updateSplitRow={updateSplitRow}
          removeSplitRow={removeSplitRow}
          getTotalSplitAmount={getTotalSplitAmount}
        />
      )}

      <label>Total Amount</label>
      <input
        type="number"
        value={amount}
        className={styles.modalFormInput}
        readOnly
      />

      <button type="submit" className={styles.buttonSubmit}>
        Save
      </button>
    </form>
  );
}
