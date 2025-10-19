"use client";

import { useState } from "react";

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
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder="Enter transaction name"
      />
      <label>Amount</label>
      <input
        value={data.amount}
        onChange={(e) => setData({ ...data, amount: e.target.value })}
        placeholder="Enter amount"
      />
      <button type="submit">Save</button>
    </form>
  );
}
