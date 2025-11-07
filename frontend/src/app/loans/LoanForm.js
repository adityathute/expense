"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/components/modalForm.module.css";
import { formatAccountOption } from "../transactions/forms/utils/accountFormat";

export default function LoanForm({ onClose, onSubmit, accounts = [] }) {
    // ---------- Form State ----------
    const [loanId, setLoanId] = useState("");
    const [partyName, setPartyName] = useState("");
    const [loanDate, setLoanDate] = useState("");
    const [description, setDescription] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [disbursedAmount, setDisbursedAmount] = useState(null);
    const [principalAmount, setPrincipalAmount] = useState(null);
    const [emiAmount, setEmiAmount] = useState(null);
    const [totalEmiAmount, setTotalEmiAmount] = useState(null);
    const [interestInputType, setInterestInputType] = useState("rate"); // "rate" or "amount"
    const [interestRate, setInterestRate] = useState(null);
    const [interestAmount, setInterestAmount] = useState(null);
    const [tenure, setTenure] = useState(null); // in months
    const [interestFrequency, setInterestFrequency] = useState("yearly"); // "monthly" or "yearly"
    const [processingFees, setProcessingFees] = useState(0);
    const [totalPayable, setTotalPayable] = useState(0);
    const [effectiveCostPercent, setEffectiveCostPercent] = useState(0);
    const [showLoanDetails, setShowLoanDetails] = useState(false); // advanced mode

    // ---------- Helper: Number Input ----------
    const handleNumberInput = (setter) => (e) => {
        const val = e.target.value;
        setter(val === "" ? null : Number(val));
    };

    // ---------- Loan Calculation ----------
    // ---------- Loan Calculation ----------
    const updateLoanSummary = () => {
        const principal = showLoanDetails
            ? Number(principalAmount) || Number(disbursedAmount) || 0
            : Number(disbursedAmount) || 0;

        const months = Number(tenure) || 0;
        const rate = Number(interestRate) || 0;

        if (principal <= 0 || months <= 0) return;

        if (showLoanDetails && totalEmiAmount > 0) {
            // --- Advanced Mode (manual EMI) ---
            const pf = principal - (disbursedAmount || principal); // processing fees
            const interestAmt = totalEmiAmount - principal;
            const yearlyInterestRate = (interestAmt / principal) / (months / 12) * 100;
            const totalPay = principal + interestAmt;
            const effectiveCost = ((interestAmt + pf) / (disbursedAmount || principal)) * 100;
            const emi = totalEmiAmount / months;

            setProcessingFees(pf);
            setInterestAmount(interestAmt);
            setInterestRate(yearlyInterestRate);
            setTotalPayable(totalPay);
            setEffectiveCostPercent(effectiveCost);
            setEmiAmount(emi);
        } else {
            // --- Simple/Compound Interest Mode ---
            let totalPay = 0;

            if (interestInputType === "rate") {
                if (interestFrequency === "yearly") {
                    const years = months / 12;
                    totalPay = principal * Math.pow(1 + rate / 100, years); // yearly compounding
                } else {
                    const monthlyRate = rate / 12 / 100;
                    totalPay = principal * Math.pow(1 + monthlyRate, months); // monthly compounding
                }
            } else {
                // user entered interest amount directly
                totalPay = principal + (Number(interestAmount) || 0);
            }

            const interestAmt = totalPay - principal;
            const effectiveCost = (interestAmt / principal) * 100;

            setPrincipalAmount(principal);
            setTotalPayable(totalPay);
            setInterestAmount(interestAmt);
            setEffectiveCostPercent(effectiveCost);
            setProcessingFees(0);
        }
    };

    // ---------- Auto Update Loan Summary ----------
    useEffect(() => {
        updateLoanSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        disbursedAmount,
        principalAmount,
        totalEmiAmount,
        tenure,
        interestRate,
        interestAmount,
        interestFrequency,
        interestInputType,
        showLoanDetails,
    ]);

    // ---------- Handle Form Submit ----------
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            loanId,
            partyName,
            loanDate,
            account: selectedAccount,
            disbursedAmount: Number(disbursedAmount) || 0,
            principalAmount: Number(principalAmount) || 0,
            totalEmiAmount: Number(totalEmiAmount) || 0,
            interestRate: Number(interestRate) || 0,
            interestAmount: Number(interestAmount) || 0,
            processingFees: Number(processingFees) || 0,
            totalPayable: Number(totalPayable) || 0,
            effectiveCostPercent: Number(effectiveCostPercent) || 0,
            tenure: Number(tenure) || 0,
            interestFrequency,
            interestInputType,
            description,
        };
        console.log("📦 Loan Payload:", payload);
        if (onSubmit) onSubmit(payload);
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* ---------- Account + Disbursed Amount ---------- */}
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                <div style={{ flex: 1 }}>
                    <label>Select Account</label>
                    <select
                        className={styles.modalFormInput}
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        <option value="">--Select Account--</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {formatAccountOption(acc)}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label>Disbursed Amount (₹)</label>
                    <input
                        type="number"
                        className={styles.modalFormInput}
                        value={disbursedAmount ?? ""}
                        onChange={handleNumberInput(setDisbursedAmount)}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
            </div>

            {/* ---------- Loan ID + Party Name ---------- */}
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                <div style={{ flex: 1 }}>
                    <label>Loan ID</label>
                    <input
                        type="text"
                        className={styles.modalFormInput}
                        value={loanId}
                        onChange={(e) => setLoanId(e.target.value)}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Party Name</label>
                    <input
                        type="text"
                        className={styles.modalFormInput}
                        value={partyName}
                        onChange={(e) => setPartyName(e.target.value)}
                    />
                </div>
            </div>

            {/* ---------- Loan Date + Tenure + Frequency ---------- */}
            <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                <div style={{ flex: 1 }}>
                    <label>Loan Date</label>
                    <input
                        type="date"
                        className={styles.modalFormInput}
                        value={loanDate}
                        onChange={(e) => setLoanDate(e.target.value)}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Tenure (Months)</label>
                    <input
                        type="number"
                        className={styles.modalFormInput}
                        value={tenure ?? ""}
                        onChange={handleNumberInput(setTenure)}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label>Frequency</label>
                    <select
                        className={styles.modalFormInput}
                        value={interestFrequency}
                        onChange={(e) => setInterestFrequency(e.target.value)}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            </div>

            {/* ---------- Advanced Mode Toggle ---------- */}
            <label className={styles.uiCheckbox} style={{ marginTop: ".5rem" }}>
                <input
                    type="checkbox"
                    checked={showLoanDetails}
                    onChange={() => {
                        const newMode = !showLoanDetails;
                        setShowLoanDetails(newMode);
                        // reset all values for clarity when switching mode
                        setPrincipalAmount(null);
                        setEmiAmount(null);
                        setTotalEmiAmount(null);
                        setInterestRate(null);
                        setInterestAmount(null);
                        setTotalPayable(0);
                        setEffectiveCostPercent(0);
                        setProcessingFees(0);
                    }}
                />
                <span></span>
                Advanced Mode
            </label>

            {/* ---------- Simple Mode Inputs ---------- */}
            {!showLoanDetails && (
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
                    <div style={{ flex: 1 }}>
                        <label>Interest Type</label>
                        <select
                            className={styles.modalFormInput}
                            value={interestInputType}
                            onChange={(e) => setInterestInputType(e.target.value)}
                        >
                            <option value="rate">Interest Rate (%)</option>
                            <option value="amount">Interest Amount (₹)</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        {interestInputType === "rate" ? (
                            <>
                                <label>Interest Rate (%)</label>
                                <input
                                    type="number"
                                    className={styles.modalFormInput}
                                    value={interestRate ?? ""}
                                    onChange={handleNumberInput(setInterestRate)}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </>
                        ) : (
                            <>
                                <label>Interest Amount (₹)</label>
                                <input
                                    type="number"
                                    className={styles.modalFormInput}
                                    value={interestAmount ?? ""}
                                    onChange={handleNumberInput(setInterestAmount)}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ---------- Advanced Mode Inputs ---------- */}
            {showLoanDetails && (
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                    <div style={{ flex: 1 }}>
                        <label>Principal Amount</label>
                        <input
                            type="number"
                            className={styles.modalFormInput}
                            value={principalAmount ?? ""}
                            onChange={handleNumberInput(setPrincipalAmount)}
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>EMI Amount</label>
                        <input
                            type="number"
                            className={styles.modalFormInput}
                            value={emiAmount ?? ""}
                            onChange={handleNumberInput(setEmiAmount)}
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Total EMI Amount</label>
                        <input
                            type="number"
                            className={styles.modalFormInput}
                            value={totalEmiAmount ?? ""}
                            onChange={handleNumberInput(setTotalEmiAmount)}
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>
                </div>
            )}

            {/* ---------- Loan Summary ---------- */}
            <div
                style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    border: "1px solid #333",
                    borderRadius: "10px",
                    backgroundColor: "#1e1e1e",
                    color: "#ccc",
                }}
            >
                <h4 style={{ color: "#fff" }}>Loan Summary</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                    <p>
                        <strong>Principal:</strong> ₹{principalAmount ?? 0}
                    </p>
                    <p>
                        <strong>Disbursed:</strong> ₹{disbursedAmount ?? 0}
                    </p>
                    <p>
                        <strong>Interest Rate:</strong>{" "}
                        {interestRate ? `${interestRate.toFixed(2)}%` : "0%"}
                    </p>
                    <p>
                        <strong>Tenure:</strong> {tenure ?? 0} months
                    </p>
                    <p>
                        <strong>Frequency:</strong>{" "}
                        {interestFrequency.charAt(0).toUpperCase() + interestFrequency.slice(1)}
                    </p>
                    {showLoanDetails && <p><strong>EMI:</strong> ₹{emiAmount?.toFixed(2) || 0}</p>}
                    {showLoanDetails && <p><strong>Processing Fees:</strong> ₹{processingFees ?? 0}</p>}
                    <p><strong>Total Interest:</strong> ₹{interestAmount?.toFixed(2) || 0}</p>
                    <p><strong>Total Payable:</strong> ₹{totalPayable?.toFixed(2) || 0}</p>
                    <p><strong>Effective Cost %:</strong> {effectiveCostPercent?.toFixed(2) || 0}%</p>
                </div>
            </div>

            <label style={{ marginTop: ".75rem", display: "block" }}>Description</label>
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
