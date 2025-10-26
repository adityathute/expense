"use client";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/components/modalForm.module.css";
import { DeleteIcon } from "../../../components/Icons";
import { formatAccountOption } from "../utils/accountFormat";

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
  setStatus
}) {
  const [useDueRange, setUseDueRange] = useState(false);

  const recurringAllowed = ["Income", "Expense", "Savings", "Investments", "Loans"].includes(selectedCore);
  const isTransfer = selectedCore === "Transfer";
  const isIncomeExpense = selectedCore === "Income" || selectedCore === "Expense";

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
        </>
      )}
    </>
  );
}
