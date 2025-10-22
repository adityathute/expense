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

  // Fetch categories whenever categoryType changes or Finance is selected
  useEffect(() => {
    if (type !== "finance") return;

    const fetchCategories = async () => {
      try {
        // Send type param to backend to filter categories by Shop/Personal
        const res = await fetch(
          `http://127.0.0.1:8001/api/categories/?type=${categoryType}`
        );
        const data = await res.json();
        setCategoryOptions(data.categories || []);
      } catch (err) {
        console.error(err);
        setCategoryOptions([]);
      }
    };

    fetchCategories();
  }, [type, categoryType]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (type === "service" && !selectedService) {
      alert("Please select a service");
      return;
    }
    if (type === "finance" && !selectedCategory) {
      alert("Please select a category");
      return;
    }

    const payload = type === "service"
      ? { user, amount, service: selectedService }
      : { user, amount, category: selectedCategory };

    const endpoint =
      type === "service"
        ? "http://127.0.0.1:8001/api/service-transactions/"
        : "http://127.0.0.1:8001/api/finance-transactions/";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw res;
        return res.json();
      })
      .then(() => onSubmit())
      .catch(async (err) => {
        if (err instanceof Response) {
          const text = await err.text();
          console.error("POST error response:", text);
        } else {
          console.error("POST error:", err);
        }
      });
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
          {/* Category Type Switch on top */}
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
            {categoryOptions.map((c) => (
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
