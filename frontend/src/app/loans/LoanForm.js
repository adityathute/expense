"use client";
import React, { useState, useEffect } from "react";
import styles from "../styles/components/modalForm.module.css";
import { formatAccountOption } from "../transactions/forms/utils/accountFormat";

export default function LoanForm({ onClose, onSubmit, accounts = [] }) {
    const [loanId, setLoanId] = useState("");
    const [partyName, setPartyName] = useState("");
    const [loanDate, setLoanDate] = useState("");
    const [description, setDescription] = useState("");

    const [selectedAccount, setSelectedAccount] = useState("");
    const [disbursedAmount, setDisbursedAmount] = useState("");
    const [processingFees, setProcessingFees] = useState(0);

    const [interestInputType, setInterestInputType] = useState("rate"); // rate or amount
    const [interestRate, setInterestRate] = useState("");
    const [interestAmount, setInterestAmount] = useState("");
    const [tenure, setTenure] = useState("");
    const [interestFrequency, setInterestFrequency] = useState("yearly");

    const [effectiveCostPercent, setEffectiveCostPercent] = useState(0);
    const [principalAmount, setPrincipalAmount] = useState(0);
    const [totalPayable, setTotalPayable] = useState(0);

    const [showLoanDetails, setShowLoanDetails] = useState(false);

    // ---------- Loan Calculation ----------
    const calculateLoanDetails = ({
        principal,
        tenure,
        interestRate,
        interestAmount,
        inputType,
        interestFrequency,
    }) => {
        principal = Number(principal) || 0;
        tenure = Number(tenure) || 0;
        interestRate = Number(interestRate) || 0;
        interestAmount = Number(interestAmount) || 0;

        if (principal <= 0 || tenure <= 0) {
            return {
                totalInterest: 0,
                totalPayable: 0,
                effectiveCostPercent: 0,
                calculatedInterestRate: 0,
            };
        }

        const n = interestFrequency === "monthly" ? 12 : 1;
        const t = tenure / 12; // in years
        let totalInterest = 0;
        let totalPayable = 0;
        let calculatedInterestRate = 0;

        if (inputType === "rate") {
            const r = interestRate / 100;
            totalPayable = principal * Math.pow(1 + r / n, n * t);
            totalInterest = totalPayable - principal;
            calculatedInterestRate = interestRate;
        } else {
            // input type = amount
            totalInterest = interestAmount;
            totalPayable = principal + totalInterest;
            const periods = n * t;
            const rateDecimal = Math.pow(totalPayable / principal, 1 / periods) - 1;
            calculatedInterestRate =
                interestFrequency === "yearly" ? rateDecimal * 100 : rateDecimal * 100 * 12;
            if (!isFinite(calculatedInterestRate)) calculatedInterestRate = 0;
        }

        const effectiveCostPercent = (totalInterest / principal) * 100;

        return {
            totalInterest: parseFloat(totalInterest.toFixed(2)),
            totalPayable: parseFloat(totalPayable.toFixed(2)),
            effectiveCostPercent: parseFloat(effectiveCostPercent.toFixed(2)),
            calculatedInterestRate: parseFloat(calculatedInterestRate.toFixed(2)),
        };
    };

    const updateLoanSummary = () => {
        const principal = Number(disbursedAmount) || 0;
        const t = Number(tenure) || 0;

        if (principal <= 0 || t <= 0) return;

        const details = calculateLoanDetails({
            principal,
            tenure: t,
            interestRate: Number(interestRate),
            interestAmount: Number(interestAmount),
            inputType: interestInputType,
            interestFrequency,
        });

        setPrincipalAmount(principal);
        setTotalPayable(details.totalPayable);
        setEffectiveCostPercent(details.effectiveCostPercent);

        if (interestInputType === "rate") {
            setInterestAmount(details.totalInterest);
        } else {
            setInterestRate(details.calculatedInterestRate);
        }
    };

    // ---------- Update when any relevant field changes ----------
    useEffect(() => {
        updateLoanSummary();
    }, [disbursedAmount, tenure, interestRate, interestAmount, interestFrequency, interestInputType]);

    const handleInterestChange = (value) => {
        if (interestInputType === "rate") {
            setInterestRate(Number(value));
        } else {
            setInterestAmount(Number(value));
        }
    };

    const resetLoanFields = () => {
        setPrincipalAmount("");
        setInterestRate("");
        setInterestAmount("");
        setTotalPayable("");
        setEffectiveCostPercent(0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            loanId,
            partyName,
            loanDate,
            account: selectedAccount,
            amount: Number(disbursedAmount),
            interestRate: Number(interestRate),
            interestAmount: Number(interestAmount),
            tenure: Number(tenure),
            interestFrequency,
            interestInputType,
            principalAmount,
            totalPayable,
        };
        console.log("📦 Loan Payload:", payload);
        if (onSubmit) onSubmit(payload);
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Account + Disbursed Amount */}
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
                        value={disbursedAmount}
                        onChange={(e) => setDisbursedAmount(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                    />
                </div>
            </div>

            {/* Loan ID + Party Name */}
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

            {/* Loan Date + Tenure + Frequency */}
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
                        value={tenure}
                        onChange={(e) => setTenure(e.target.value)}
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

            {/* Simple Interest Input */}
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
                                    value={interestRate}
                                    onChange={(e) => handleInterestChange(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </>
                        ) : (
                            <>
                                <label>Interest Amount (₹)</label>
                                <input
                                    type="number"
                                    className={styles.modalFormInput}
                                    value={interestAmount}
                                    onChange={(e) => handleInterestChange(e.target.value)}
                                    onWheel={(e) => e.target.blur()}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Loan Summary */}
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
                        <strong>Principal:</strong> ₹{principalAmount || 0}
                    </p>
                    <p>
                        <strong>Disbursed:</strong> ₹{Number(disbursedAmount) || 0}
                    </p>
                    <p>
                        <strong>Interest Rate:</strong>{" "}
                        {Number(interestRate) ? `${Number(interestRate).toFixed(2)}%` : "0%"}
                    </p>
                    <p>
                        <strong>Tenure:</strong> {tenure || 0} months
                    </p>
                    <p>
                        <strong>Frequency:</strong>{" "}
                        {interestFrequency.charAt(0).toUpperCase() + interestFrequency.slice(1)}
                    </p>
                    {!showLoanDetails && processingFees > 0 && (
                        <p>
                            <strong>Processing Fees:</strong> ₹{processingFees}
                        </p>
                    )}
                    <p>
                        <strong>Total Interest:</strong> ₹{(totalPayable - principalAmount).toFixed(2)}
                    </p>
                    <p>
                        <strong>Total Payable:</strong> ₹{totalPayable.toFixed(2)}
                    </p>
                    <p>
                        <strong>Effective Cost %:</strong> {Number(effectiveCostPercent).toFixed(2)}%
                    </p>
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
