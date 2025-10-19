"use client";

import { useState } from "react";
import styles from "../../styles/components/modalForm.module.css";

export default function NewTransactionForm({ onSubmit }) {
  const [data, setData] = useState({ name: "", amount: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input
        value={data.name}
        className={styles.modalFormInput}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder="Enter transaction name"
      />
      <label>Amount</label>
      <input
        value={data.amount}
        className={styles.modalFormInput}
        onChange={(e) => setData({ ...data, amount: e.target.value })}
        placeholder="Enter amount"
      />
      <button className={styles.buttonSubmit} type="submit">Save</button>
    </form>
  );
}
