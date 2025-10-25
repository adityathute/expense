"use client";

import React from "react";
import Modal from "../components/Modal";
import styles from "../styles/components/modalForm.module.css";

export default function AccountFormModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    editingId,
    onDelete,
}) {
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const isCash = formData.account_mode === "Cash";
    const isBank = formData.account_mode === "Online" || formData.account_mode === "Savings";
    const isInvestment = formData.account_mode === "Investments";
    // Determine placeholder based on sub_account_type
    let namePlaceholder = "Bank / Institution Name";
    if (formData.sub_account_type === "Fixed Deposit") {
        namePlaceholder = "Bank Name";
    } else if (formData.sub_account_type === "SIP/Mutual Funds") {
        namePlaceholder = "Institute Name";
    } else if (formData.sub_account_type === "Gold") {
        namePlaceholder = "Jewelry Shop Name";
    } else if (formData.sub_account_type === "Deposits") {
        namePlaceholder = "Deposit Institution Name";
    } else if (formData.sub_account_type === "Others") {
        namePlaceholder = "Name";
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? "Edit Account" : "Add Account"}
        >
            <div className="form">
                {/* Account Mode */}
                <select
                    name="account_mode"
                    className={styles.modalFormInput}
                    value={formData.account_mode || ""}
                    onChange={handleChange}
                >
                    <option value="">Select Account Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="Savings">Savings</option>
                    <option value="Investments">Investments</option>
                </select>

                {/* Sub Account Type for Investments */}
                {isInvestment && (
                    <select
                        name="sub_account_type"
                        className={styles.modalFormInput}
                        value={formData.sub_account_type || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select Sub Account Type</option>
                        <option value="Fixed Deposit">Fixed Deposit</option>
                        <option value="SIP/Mutual Funds">SIP / Mutual Funds</option>
                        <option value="Gold">Gold</option>
                        <option value="Deposits">Deposits</option>
                        <option value="Others">Others</option>
                    </select>
                )}

                {/* Cash Mode */}
                {isCash && (
                    <input
                        type="text"
                        name="bank_service_name"
                        className={styles.modalFormInput}
                        placeholder="Service Name"
                        value={formData.bank_service_name}
                        onChange={handleChange}
                    />
                )}

                {/* Bank/Savings Mode */}
                {isBank && (
                    <>
                        <input
                            type="text"
                            name="bank_service_name"
                            className={styles.modalFormInput}
                            placeholder="Bank Name"
                            value={formData.bank_service_name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="account_holder_name"
                            className={styles.modalFormInput}
                            placeholder="Account Holder Name"
                            value={formData.account_holder_name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="account_number"
                            className={styles.modalFormInput}
                            placeholder="Account Number"
                            value={formData.account_number}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="ifsc_code"
                            className={styles.modalFormInput}
                            placeholder="IFSC Code"
                            value={formData.ifsc_code}
                            onChange={handleChange}
                        />
                    </>
                )}

                {/* Investments Mode */}
                {isInvestment && (
                    <>
                        <input
                            type="text"
                            name="bank_service_name"
                            className={styles.modalFormInput}
                            placeholder={namePlaceholder}
                            value={formData.bank_service_name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="account_holder_name"
                            className={styles.modalFormInput}
                            placeholder="Account Holder Name"
                            value={formData.account_holder_name}
                            onChange={handleChange}
                        />
                        <input
                            type="date"
                            name="issue_date"
                            className={styles.modalFormInput}
                            placeholder="Issue Date"
                            value={formData.issue_date || ""}
                            onChange={handleChange}
                        />
                    </>
                )}

                {/* Balance */}
                <input
                    type="number"
                    name="balance"
                    className={styles.modalFormInput}
                    placeholder="Initial Balance"
                    value={formData.balance}
                    onChange={handleChange}
                    step="0.01"
                />

                {/* Category */}
                <select
                    name="category"
                    value={formData.category || "Business"}
                    onChange={handleChange}
                    className={styles.modalFormInput}
                >
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                </select>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    {!editingId && (
                        <button onClick={onSubmit} className={styles.buttonSubmit}>
                            Submit
                        </button>
                    )}

                    {editingId && (
                        <>
                            <button onClick={onSubmit} className="service-edit-btn">
                                ✎ Update
                            </button>
                            <button onClick={onDelete} className="service-delete-btn">
                                🗑 Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
