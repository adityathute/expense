"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";

export default function NewServiceTransactionForm({ onSubmit }) {
  const [user, setUser] = useState("");
  const [users, setUsers] = useState([]);
  const [service, setService] = useState("");
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/users/")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : data.results || []))
      .catch((err) => console.error("Error fetching users:", err));

    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => res.json())
      .then((data) => setServices(Array.isArray(data) ? data : data.results || []))
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!service) return alert("Please select a service");

    const payload = {
      user: user || null,
      service: parseInt(service),
      description,
    };

    try {
      const res = await fetch("http://127.0.0.1:8001/api/service-transactions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      onSubmit();
    } catch (err) {
      console.error("Service transaction error:", err);
      alert("Failed to save service transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      <label>User</label>
      <select
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className={styles.modalFormInput}
      >
        <option value="">--Select User--</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <label>Service</label>
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className={styles.modalFormInput}
      >
        <option value="">--Select Service--</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.modalFormInput}
        placeholder="Enter description..."
        rows={3}
      />

      <button type="submit" className={styles.buttonSubmit}>
        Save
      </button>
    </form>
  );
}
