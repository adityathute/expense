"use client";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/components/modalForm.module.css";
import { DeleteIcon } from "../../../components/Icons";
import { formatAccountOption } from "../utils/accountFormat";
import { calculateLoanDetails } from "../utils/loanCalculations";

export default function FinanceForm({
  categoryType,
  setCategoryType,
  selectedCore,
  setSelectedCore,
  availableCoreCategories,
  categories,
  selectedLeaf,
  onLeafChange,
  selectedCategory,
  accounts,
  splits,
  addSplitRow,
  updateSplitRow,
  removeSplitRow,
  getTotalSplitAmount,
  isRecurring,
  setIsRecurring,
  frequency,
  setFrequency,
  nextDueDate,
  setNextDueDate,
  dueRangeStart,
  setDueRangeStart,
  dueRangeEnd,
  setDueRangeEnd,
  status,
  setStatus,
  user,
  setUser,
  userOptions,
  debtType,
  setDebtType,
}) {
  const [useDueRange, setUseDueRange] = useState(false);

  const recurringAllowed = ["Income", "Expense", "Savings", "Investments", "Loans"].includes(selectedCore);
  const isTransfer = selectedCore === "Transfer";
  const isIncomeExpense = selectedCore === "Income" || selectedCore === "Expense";
  const showUserField = ["Income", "Expense", "Debts"].includes(selectedCore);
  const [showLoanDetails, setShowLoanDetails] = useState(false);

  // Render nested category options recursively
  const renderCategoryOptions = (nodes, level = 0) =>
    nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const indent = "\u00A0\u00A0".repeat(level);
      return (
        <React.Fragment key={node.id}>
          <option value={node.id} disabled={hasChildren}>
            {indent}{node.name}
          </option>
          {hasChildren && renderCategoryOptions(node.children, level + 1)}
        </React.Fragment>
      );
    });

  // Filter accounts based on core category type
  const getFilteredAccounts = () => {
    if (!accounts) return [];

    switch (selectedCore) {
      case "Income":
      case "Expense":
      case "Loans":
      case "Debts":
        return accounts.filter(acc =>
          ["Cash", "Online"].includes(acc.account_mode)
        );
      case "Savings":
        return accounts.filter(acc => acc.account_mode === "Savings");
      case "Investments":
        return accounts.filter(acc => acc.account_mode === "Investments");
      case "Transfer":
        return accounts; // all accounts
      default:
        return [];
    }
  };

  const [loanId, setLoanId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [loanDate, setLoanDate] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [totalEmiAmount, setTotalEmiAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");
  const [totalPayable, setTotalPayable] = useState("");
  const [processingFees, setProcessingFees] = useState("");
  const [effectiveCostPercent, setEffectiveCostPercent] = useState("");
  const [disbursedAmount, setDisbursedAmount] = useState("");
  const [interestInputType, setInterestInputType] = useState("rate"); // "rate" or "amount"
  const [interestFrequency, setInterestFrequency] = useState("yearly"); // Added missing variable

  // ✅ Auto-calculate whenever loan details change
  useEffect(() => {
    const principal = Number(principalAmount) || 0;
    const disbursed = Number(disbursedAmount) || 0;
    const tenureVal = Number(tenure) || 0;
    const rate = Number(interestRate) || 0;
    const totalEmi = Number(totalEmiAmount) || 0;
    const emiVal = Number(emiAmount) || 0;

    // Auto-calculate processing fees (difference between principal & disbursed)
    const feeValue = Math.max(principal - disbursed, 0);

    const results = calculateLoanDetails({
      principal,
      interestRate: rate,
      tenure: tenureVal,
      interestFrequency,
      disbursedAmount: disbursed,
      processingFees: feeValue,
      totalEmiAmount: totalEmi,
    });

    setProcessingFees(feeValue);
    setEmiAmount(results.EMI || 0);
    setInterestAmount(results.totalInterest || 0);
    setTotalPayable(results.totalPayable || 0);
    setEffectiveCostPercent(results.effectiveCostPercent || 0);

    // Optional: auto-fill rate if not provided
    if ((!interestRate || interestRate === "") && results.annualizedInterestPercent > 0) {
      setInterestRate(results.annualizedInterestPercent);
    }
  }, [
    principalAmount,
    tenure,
    interestFrequency,
    disbursedAmount,
    totalEmiAmount,
    interestRate,
  ]);

  return (
    <>
      {/* Core Category */}
      <label>Select Core Category</label>
      <select
        value={selectedCore}
        className={styles.modalFormInput}
        onChange={(e) => setSelectedCore(e.target.value)}
      >
        <option value="">--Select Core Category--</option>
        {availableCoreCategories.map(core => (
          <option key={core} value={core}>{core}</option>
        ))}
      </select>

      {/* Transfer Section */}
      {isTransfer && (
        <div>
          <label>From Account</label>
          <select
            value={splits[0]?.account || ""}
            onChange={(e) => {
              const val = e.target.value;
              updateSplitRow(0, "account", val);
              if (splits[1]?.account === val) updateSplitRow(1, "account", "");
            }}
            className={styles.modalFormInput}
          >
            <option value="">--Select From Account--</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{formatAccountOption(acc)}</option>
            ))}
          </select>

          <label>To Account</label>
          <select
            value={splits[1]?.account || ""}
            onChange={(e) => updateSplitRow(1, "account", e.target.value)}
            className={styles.modalFormInput}
          >
            <option value="">--Select To Account--</option>
            {accounts
              .filter(acc => acc.id !== Number(splits[0]?.account))
              .map(acc => (
                <option key={acc.id} value={acc.id}>{formatAccountOption(acc)}</option>
              ))}
          </select>

          <label>Amount</label>
          <input
            type="number"
            value={splits[0]?.amount || ""}
            onChange={(e) => {
              const val = e.target.value;
              updateSplitRow(0, "amount", val);
              updateSplitRow(1, "amount", val);
            }}
            onWheel={(e) => e.target.blur()} // disable scroll
            className={styles.modalFormInput}
          />
        </div>
      )}

      {isIncomeExpense && (
        <>
          {/* Switch for Shop / Personal */}
          <div className="main-switch-header" style={{ marginBottom: ".5rem" }}>
            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={categoryType}
                  onChange={() => setCategoryType(!categoryType)}
                />
                <span className="slider"></span>
              </label>
              <span className="switch-text">{categoryType ? "Personal" : "Shop"}</span>
            </div>
          </div>

          <label>Select Category</label>
          <select
            value={selectedLeaf}
            className={styles.modalFormInput}
            onChange={onLeafChange}
          >
            <option value="">--Select--</option>
            {renderCategoryOptions(
              categories.filter(cat => String(cat.category_type) === String(categoryType))
            )}
          </select>
        </>
      )}

      {showUserField && (
        <>
          <label>Select User</label>
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className={styles.modalFormInput}
          >
            <option value="">--Select User--</option>
            {userOptions.map(u => (
              <option key={u.id} value={u.id}>
                {u.name || u.username}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Income / Expense Section */}
      {isIncomeExpense && categories.length > 0 && (
        <>
          {/* Split accounts section remains unchanged */}
          <div>
            {splits.map((split, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: ".25rem" }}>
                <select
                  value={split.account || ""}
                  onChange={(e) => updateSplitRow(i, "account", e.target.value)}
                  className={styles.modalFormInput}
                  style={{ width: "50%" }}
                >
                  <option value="">--Select Account--</option>
                  {getFilteredAccounts()
                    .filter(acc => !splits.some((s, idx) => s.account === String(acc.id) && idx !== i))
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>{formatAccountOption(acc)}</option>
                    ))}
                </select>

                <input
                  type="number"
                  value={split.amount}
                  onChange={(e) => updateSplitRow(i, "amount", e.target.value)}
                  onWheel={(e) => e.target.blur()} // disable scroll
                  className={styles.modalFormInput}
                  style={{ width: "50%" }}
                />

                <button
                  type="button"
                  onClick={() => removeSplitRow(i)}
                  className={styles.removeButton}
                >
                  <DeleteIcon className={styles.icon} />
                </button>
              </div>
            ))}

            {getFilteredAccounts().filter(acc => !splits.some(s => s.account === String(acc.id))).length > 0 && (
              <button
                type="button"
                onClick={addSplitRow}
                className={styles.buttonAddLink}
                style={{ marginTop: ".25rem" }}
              >
                Add More Account
              </button>
            )}
          </div>
        </>
      )}

      {/* SAVINGS & INVESTMENTS SECTION - show account immediately */}
      {(selectedCore === "Savings" || selectedCore === "Investments") && (
        <div style={{ marginTop: ".5rem" }}>
          <label>Select Account</label>
          <select
            value={splits[0]?.account || ""}
            onChange={(e) => updateSplitRow(0, "account", e.target.value)}
            className={styles.modalFormInput}
          >
            <option value="">--Select Account--</option>
            {accounts
              .filter(acc => acc.account_mode === selectedCore)
              .map(acc => (
                <option key={acc.id} value={acc.id}>
                  {formatAccountOption(acc)}
                </option>
              ))}
          </select>

          <label style={{ marginTop: ".25rem" }}>Amount</label>
          <input
            type="number"
            className={styles.modalFormInput}
            value={splits[0]?.amount || ""}
            onChange={(e) => updateSplitRow(0, "amount", e.target.value)}
            onWheel={(e) => e.target.blur()} // disable scroll
          />
        </div>
      )}

      {/* DEBTS SECTION - show account + amount, then due date + interest */}
      {selectedCore === "Debts" && (
        <div style={{ marginTop: ".5rem" }}>
          <label>Transaction Type</label>
          <select
            value={debtType}
            onChange={(e) => setDebtType(e.target.value)}
            className={styles.modalFormInput}
            style={{ marginBottom: ".5rem" }}
          >
            <option value="">--Select Type--</option>
            <option value="Borrow">Borrow</option>
            <option value="Lend">Lend</option>
          </select>

          {/* Row 1: Account + Amount */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: ".5rem" }}>
            <div style={{ flex: 1 }}>
              <label>Select Account</label>
              <select
                value={splits[0]?.account || ""}
                onChange={(e) => updateSplitRow(0, "account", e.target.value)}
                className={styles.modalFormInput}
              >
                <option value="">--Select Account--</option>
                {accounts
                  .filter(acc => ["Cash", "Online"].includes(acc.account_mode))
                  .map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {formatAccountOption(acc)}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label>Amount</label>
              <input
                type="number"
                className={styles.modalFormInput}
                value={
                  debtType === "Lend" && splits[0]?.amount
                    ? -Math.abs(splits[0]?.amount)
                    : splits[0]?.amount || ""
                }
                onChange={(e) => {
                  // Store absolute value only, backend handles Lend logic
                  const val = Math.abs(Number(e.target.value));
                  updateSplitRow(0, "amount", val);
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          {/* Row 2: Due Date + Interest Amount */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label>Due Date</label>
              <input
                type="date"
                className={styles.modalFormInput}
                value={nextDueDate || ""}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Interest Amount</label>
              <input
                type="number"
                className={styles.modalFormInput}
                value={splits[0]?.interest || ""}
                onChange={(e) => updateSplitRow(0, "interest", e.target.value)}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>
        </div>
      )}

      {/* LOANS SECTION */}
      {selectedCore === "Loans" && (
        <div style={{ marginTop: ".5rem" }}>

          {/* Row 1: Account + Amount */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: ".5rem" }}>
            <div style={{ flex: 1 }}>
              <label>Select Account</label>
              <select
                value={splits[0]?.account || ""}
                onChange={(e) => updateSplitRow(0, "account", e.target.value)}
                className={styles.modalFormInput}
              >
                <option value="">--Select Account--</option>
                {accounts
                  .filter(acc => ["Cash", "Online"].includes(acc.account_mode))
                  .map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {formatAccountOption(acc)}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label>Disbursed Amount</label>
              <input
                type="number"
                className={styles.modalFormInput}
                value={disbursedAmount}
                onChange={(e) => {
                  const val = Math.abs(Number(e.target.value));
                  setDisbursedAmount(val);
                  updateSplitRow(0, "amount", val);
                }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>

          {/* Loan ID + Party Name */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: ".5rem" }}>
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

          {/* Row: Interest Rate + Tenure + Interest Frequency */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: ".5rem" }}>
            <div style={{ flex: 1 }}>
              <label>Tenure (In Months)</label>
              <input
                type="number"
                className={styles.modalFormInput}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Interest Frequency</label>
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

          {/* Interest Type + Input in one row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.5rem",
              marginBottom: ".75rem",
            }}
          >

            {/* Loan Date */}
            <div style={{ flex: 1 }}>
              <label>Loan Date</label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className={styles.modalFormInput}
              />
            </div>

            {/* Interest Type Dropdown */}
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

            {/* Interest Input Field */}
            <div style={{ flex: 1 }}>
              {interestInputType === "rate" ? (
                <>
                  <label>Interest Rate (%)</label>
                  <input
                    type="number"
                    className={styles.modalFormInput}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    onWheel={(e) => e.target.blur()}
                  />
                </>
              ) : (
                <>
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    className={styles.modalFormInput}
                    value={interestAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setInterestAmount(val);
                      if (principalAmount > 0 && tenure > 0) {
                        const rate = (val / principalAmount / tenure) * 100;
                        setInterestRate(parseFloat(rate.toFixed(2)));
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </>
              )}
            </div>
          </div>

          {/* TOGGLE — Show Full Loan Details */}
          <label className={styles.uiCheckbox} style={{ marginTop: ".5rem" }}>
            <input
              type="checkbox"
              checked={showLoanDetails}
              onChange={() => setShowLoanDetails(!showLoanDetails)}
            />
            <span></span>
            Full Loan Details
          </label>

          {showLoanDetails && (
            <>
              {/* Row 2: Principle Amount + EMI Amount + Total EMI Amount */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", marginBottom: ".5rem" }}>
                <div style={{ flex: 1 }}>
                  <label>Principle Amount</label>
                  <input
                    type="number"
                    className={styles.modalFormInput}
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>EMI Amount</label>
                  <input
                    type="number"
                    className={styles.modalFormInput}
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(Number(e.target.value))}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label>Total EMI Amount</label>
                  <input
                    type="number"
                    className={styles.modalFormInput}
                    value={totalEmiAmount}
                    onChange={(e) => setTotalEmiAmount(Number(e.target.value))}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

              </div>
            </>
          )}

        </div>
      )}

      {/* Recurring Section */}
      {recurringAllowed && (
        <>
          <label className={styles.uiCheckbox} style={{ marginTop: ".5rem" }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
            />
            <span></span>
            Is Recurring
          </label>

          {isRecurring && (
            <>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", marginTop: ".25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <label>Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className={styles.modalFormInput}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={styles.modalFormInput}
                  >
                    <option value="planned">Planned</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: ".25rem" }}>
                <label>Next Due Date</label>
                <input
                  type="date"
                  value={nextDueDate || ""}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className={styles.modalFormInput}
                />
              </div>

              <label className={styles.uiCheckbox} style={{ marginTop: ".5rem" }}>
                <input
                  type="checkbox"
                  checked={useDueRange}
                  onChange={() => setUseDueRange(!useDueRange)}
                />
                <span></span>
                Use Date Range
              </label>

              {useDueRange && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: ".25rem" }}>
                  <div style={{ flex: 1 }}>
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={dueRangeStart || ""}
                      onChange={(e) => setDueRangeStart(e.target.value)}
                      className={styles.modalFormInput}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label>End Date</label>
                    <input
                      type="date"
                      value={dueRangeEnd || ""}
                      onChange={(e) => setDueRangeEnd(e.target.value)}
                      className={styles.modalFormInput}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ✅ Loan Summary — Auto calculated */}
          {selectedCore === "Loans" && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #333",
                borderRadius: "10px",
                backgroundColor: "#1e1e1e",
                color: "#ccc",
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              }}
            >
              <h4 style={{ marginBottom: "0.5rem", color: "#fff" }}>Loan Summary</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  fontSize: "0.95rem",
                }}
              >
                <p><strong>Principal:</strong> ₹{principalAmount || 0}</p>
                <p><strong>Disbursed:</strong> ₹{Number(disbursedAmount) || 0}</p>
                <p><strong>Interest Rate:</strong> {Number(interestRate) ? `${Math.abs(Number(interestRate)).toFixed(2)}%` : "0%"}</p>
                <p><strong>Tenure:</strong> {tenure || 0} months</p>
                <p><strong>Interest Frequency:</strong> {interestFrequency}</p>
                <p><strong>EMI Amount:</strong> ₹{emiAmount || 0}</p>
                <p><strong>Total Interest:</strong> ₹{interestAmount || 0}</p>
                <p><strong>Processing Fees:</strong> ₹{processingFees || 0}</p>
                <p><strong>Total Cost:</strong> ₹{(Number(interestAmount || 0) + Number(processingFees || 0)).toLocaleString()}</p>
                <p><strong>Total Payable:</strong> ₹{totalPayable || 0}</p>
                <p>
                  <strong>Effective Cost %:</strong>{" "}
                  {effectiveCostPercent ? `${effectiveCostPercent}%` : "0%"}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
