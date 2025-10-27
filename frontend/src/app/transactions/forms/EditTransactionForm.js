"use client";

import { useState } from "react";
import styles from "../../styles/components/modalForm.module.css";

export default function EditTransactionForm({ existing, onSubmit, onCancel }) {
    const [data, setData] = useState(existing || {});

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
            />
            <label>Amount</label>
            <input
                type="number"
                value={data.amount}
                className={styles.modalFormInput}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="submit" className={styles.buttonSubmit}>Update</button>
            </div>
            {onCancel && (
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            )}
        </form>
    );
}
