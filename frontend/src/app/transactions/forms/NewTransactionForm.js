"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";

export default function NewTransactionForm({ onSubmit }) {
  const [type, setType] = useState("service"); // "service" or "finance"
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [categories, setCategories] = useState([]); // hierarchical categories
  const [coreCategories, setCoreCategories] = useState([
    "Income",
    "Expense",
    "Money",
    "Debt",
    "Invest",
    "Saving",
  ]);

  const [selectedService, setSelectedService] = useState("");
  const [selectedCore, setSelectedCore] = useState("");
  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [categoryPath, setCategoryPath] = useState([]);

  const [categoryType, setCategoryType] = useState(false); // false=Shop, true=Personal

  // Fetch services
  useEffect(() => {
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
  }, []);

  // Fetch categories on type=finance or categoryType change
  useEffect(() => {
    if (type !== "finance") return;

    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8001/api/categories/?type=${categoryType}`
        );
        const data = await res.json();
        const allCategories = data.categories || [];

        // Filter only categories under selected core
        const filteredByCore = allCategories.filter(
          (cat) => cat.core_category === selectedCore
        );

        // Build tree
        const buildTree = (items, parentId = null) =>
          items
            .filter((i) => i.parent === parentId)
            .map((i) => ({
              ...i,
              children: buildTree(items, i.id),
            }));

        setCategories(buildTree(filteredByCore));
        setSelectedLeaf("");
        setCategoryPath(selectedCore ? [selectedCore] : []);
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };

    if (selectedCore) fetchCategories();
    else setCategories([]);
  }, [type, categoryType, selectedCore]);

  // Render hierarchy options recursively
  const renderOptions = (nodes, path = [], level = 0) =>
    nodes.map((node) => {
      const currentPath = [...path, node.name];
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <option value={node.id} disabled={hasChildren}>
            {"-".repeat(level)} {node.name}
          </option>
          {hasChildren && renderOptions(node.children, currentPath, level + 1)}
        </React.Fragment>
      );
    });

  // Update selected leaf and category path
  const handleLeafChange = (e) => {
    const leafId = e.target.value;
    setSelectedLeaf(leafId);

    const findPath = (nodes, targetId, path = []) => {
      for (let node of nodes) {
        const newPath = [...path, node.name];
        if (node.id == targetId) return newPath;
        if (node.children) {
          const childPath = findPath(node.children, targetId, newPath);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const path = findPath(categories, leafId);
    setCategoryPath([selectedCore, ...(path ? path.slice(1) : [])]);
  };

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

    const payload =
      type === "service"
        ? { user, amount, service: selectedService }
        : { user, amount, category_path: categoryPath };

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

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      onSubmit();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      {/* Transaction Type */}
      <label>Transaction Type</label>
      <select
        value={type}
        className={styles.modalFormInput}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="service">Service</option>
        <option value="finance">Finance</option>
      </select>

      {/* Service Selection */}
      {type === "service" && (
        <>
          <label>Select Service</label>
          <select
            value={selectedService}
            className={styles.modalFormInput}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">--Select Service--</option>
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Finance Selection */}
      {type === "finance" && (
        <>
          {/* Category Type Switch */}
          <div className="switch-container" style={{ margin: "0.5rem 0" }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={categoryType}
                onChange={() => setCategoryType(!categoryType)}
              />
              <span className="slider"></span>
            </label>
            <span style={{ marginLeft: "0.5rem" }}>
              {categoryType ? "Personal" : "Shop"}
            </span>
          </div>

          {/* Core Category */}
          <label>Select Core Category</label>
          <select
            value={selectedCore}
            className={styles.modalFormInput}
            onChange={(e) => setSelectedCore(e.target.value)}
          >
            <option value="">--Select Core Category--</option>
            {coreCategories.map((core) => (
              <option key={core} value={core}>
                {core}
              </option>
            ))}
          </select>

          {/* Hierarchy Dropdown */}
          {selectedCore && categories.length > 0 && (
            <>
              <label>Select Category</label>
              <select
                value={selectedLeaf}
                className={styles.modalFormInput}
                onChange={handleLeafChange}
              >
                <option value="">--Select--</option>
                {renderOptions(categories)}
              </select>
            </>
          )}
        </>
      )}

      {/* Amount */}
      <label>Amount</label>
      <input
        type="number"
        value={amount}
        className={styles.modalFormInput}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />

      <button type="submit" className={styles.buttonSubmit}>
        Save
      </button>
    </form>
  );
}
