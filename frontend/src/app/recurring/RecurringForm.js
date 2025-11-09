"use client";

import React, { useState } from "react";
import styles from "../styles/components/modalForm.module.css";

export default function RecurringForm({ onClose }) {
    const [formData, setFormData] = useState({
        name: "",
        tag: "",
        actualAmount: "",
        estimatedAmount: "",
        category: "expense",
        recurrenceType: "standard",
        frequency: "monthly",
        customInterval: "",
        customUnit: "days",
        nextDueDate: "",
        startDate: "",
        endDate: "",
        description: "",
    });

    // ✅ Added missing state for switch
    const [categoryType, setCategoryType] = useState(false); // false = Shop, true = Personal
    const [useDueRange, setUseDueRange] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            tag: formData.tag,
            type: categoryType ? "personal" : "shop",
            category: formData.category,
            actual_amount: formData.actualAmount || null,
            estimated_amount: formData.estimatedAmount || null,
            recurrence_type: formData.recurrenceType,
            frequency: formData.frequency,
            custom_interval: formData.customInterval || null,
            custom_unit: formData.customUnit,
            next_due_date: formData.nextDueDate || null,
            use_due_range: useDueRange,
            start_date: useDueRange ? formData.startDate || null : null,
            end_date: useDueRange ? formData.endDate || null : null,
            description: formData.description,
        };

        try {
            const response = await fetch("http://127.0.0.1:8001/api/recurring-payments/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorMessage = "Unknown error";
                try {
                    const data = await response.json();
                    errorMessage = JSON.stringify(data);
                } catch {
                    errorMessage = await response.text();
                }
                console.error("❌ Failed to create recurring payment:", errorMessage);
                alert("Error creating recurring payment. Check console for details.");
                return;
            }

            const data = await response.json();
            console.log("✅ Recurring payment saved:", data);

            // Close modal after success
            onClose();
        } catch (error) {
            console.error("❌ Network error:", error);
            alert("Network error while saving recurring payment.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Name + Tag */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: ".25rem" }}>
                <div style={{ flex: 1 }}>
                    <label>Name</label>
                    <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                        placeholder="Enter recurring name..."
                        required
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <label>Tag / Identifier</label>
                    <input
                        name="tag"
                        type="text"
                        value={formData.tag}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                        placeholder="e.g. Gas Cylinder 1 / Jio Recharge / Rent 2025"
                    />
                </div>
            </div>

            <div style={{ display: "flex", gap: ".5rem" }}>
                {/* ✅ Personal / Shop Switch */}
                <div style={{ flex: 1 }}>
                    <label>Type</label>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            marginTop: ".25rem",
                        }}
                    >
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={categoryType}
                                onChange={() => setCategoryType(!categoryType)}
                            />
                            <span className="slider"></span>
                        </label>
                        <span>{categoryType ? "Personal" : "Shop"}</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="savings">Savings</option>
                        <option value="transfer">Transfer</option>
                        <option value="investments">Investments</option>
                    </select>
                </div>
            </div>

            {/* Amount + Category */}
            <div style={{ display: "flex", gap: ".5rem" }}>
                <div style={{ flex: 1 }}>
                    <label>Actual Amount (₹)</label>
                    <input
                        name="actualAmount"
                        type="number"
                        value={formData.actualAmount || ""}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                        placeholder="Actual amount spent"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Estimated Amount (₹)</label>
                    <input
                        name="estimatedAmount"
                        type="number"
                        value={formData.estimatedAmount || ""}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                        placeholder="e.g. 1500"
                    />
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>


            </div>

            {/* Recurrence Type */}
            <div style={{ marginTop: ".5rem" }}>
                <label>Recurrence Type</label>
                <select
                    name="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={handleChange}
                    className={styles.modalFormInput}
                >
                    <option value="standard">Standard (Daily/Weekly/Monthly/Yearly)</option>
                    <option value="custom">Custom Interval</option>
                </select>
            </div>

            {/* Frequency / Custom Interval */}
            {formData.recurrenceType === "standard" ? (
                <div style={{ marginTop: ".5rem" }}>
                    <label>Frequency</label>
                    <select
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                        className={styles.modalFormInput}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: ".5rem",
                        alignItems: "flex-end",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <label>Custom Interval</label>
                        <input
                            name="customInterval"
                            type="number"
                            min="1"
                            value={formData.customInterval}
                            onChange={handleChange}
                            placeholder="e.g. 28"
                            className={styles.modalFormInput}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Unit</label>
                        <select
                            name="customUnit"
                            value={formData.customUnit}
                            onChange={handleChange}
                            className={styles.modalFormInput}
                        >
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                            <option value="months">Months</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Next Due Date */}
            <div style={{ marginTop: ".5rem" }}>
                <label>Next Due Date</label>
                <input
                    name="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={handleChange}
                    className={styles.modalFormInput}
                />
            </div>

            {/* Use Date Range */}
            <label
                className={styles.uiCheckbox}
                style={{
                    marginTop: ".5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <input
                    type="checkbox"
                    checked={useDueRange}
                    onChange={(e) => setUseDueRange(e.target.checked)}
                />
                <span></span>
                Use Date Range
            </label>

            {/* Conditional Range */}
            {useDueRange && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: ".25rem" }}>
                    <div style={{ flex: 1 }}>
                        <label>Start Date</label>
                        <input
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            className={styles.modalFormInput}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>End Date</label>
                        <input
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            className={styles.modalFormInput}
                        />
                    </div>
                </div>
            )}

            {/* Description */}
            <label style={{ marginTop: "0.75rem", display: "block" }}>Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.modalFormInput}
                placeholder="Enter description..."
                rows={3}
            />

            {/* Submit */}
            <button
                type="submit"
                className={styles.buttonSubmit}
                style={{ marginTop: "0.9rem" }}
            >
                Save
            </button>
        </form>
    );
}
