"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";

export default function NewTransactionForm({ onSubmit }) {
  const [type, setType] = useState("service"); // Service or Finance
  const [user, setUser] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryType, setCategoryType] = useState(false); // false = Shop, true = Personal

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

  // Fetch all categories once and filter later
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/categories/");
        const data = await res.json();
        setCategoryOptions(Array.isArray(data) ? data : data.categories || []);
      } catch (err) {
        console.error(err);
        setCategoryOptions([]);
      }
    };
    fetchCategories();
  }, []);

  // Reset selected category when toggle changes
  useEffect(() => {
    setSelectedCategory("");
  }, [categoryType]);

  // Filter categories based on toggle
  const filteredCategories = categoryOptions.filter(
    (c) => c.type === (categoryType ? "personal" : "shop")
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!user || !amount || (type === "service" && !selectedService) || (type === "finance" && !selectedCategory)) {
      alert("Please fill all required fields");
      return;
    }

    const payload =
      type === "service"
        ? {
            user: parseInt(user),
            amount: parseFloat(amount),
            service: parseInt(selectedService),
          }
        : {
            user: parseInt(user),
            amount: parseFloat(amount),
            category: parseInt(selectedCategory),
            category_type: categoryType ? "personal" : "shop",
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

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unknown error");
      }

      const data = await res.json();
      onSubmit(data);

      // Reset form
      setAmount("");
      setSelectedCategory("");
      setSelectedService("");
    } catch (err) {
      console.error("Transaction POST error:", err);
      alert("Failed to save transaction. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <>
          <label>Select Service</label>
          <select
            className={styles.modalFormInput}
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">--Select--</option>
            {serviceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {type === "finance" && (
        <>
          {/* Category Type Switch */}
          <div className="switch-container" style={{ margin: "0.5rem 0" }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={categoryType} // true = Personal, false = Shop
                onChange={() => setCategoryType(!categoryType)}
              />
              <span className="slider"></span>
            </label>
            <span style={{ marginLeft: "0.5rem" }}>
              {categoryType ? "Personal" : "Shop"}
            </span>
          </div>

          <label>Select Category</label>
          <select
            className={styles.modalFormInput}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">--Select--</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </>
      )}

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
