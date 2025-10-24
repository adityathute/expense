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
  setRecurringCount,
  nextDueDate,
  setNextDueDate,
  dueRangeStart,
  setDueRangeStart,
  dueRangeEnd,
  setDueRangeEnd,
  status,
  setStatus,
  lastPaymentDate,
  setLastPaymentDate,
  groupId
}) {
  const [useDueRange, setUseDueRange] = useState(false);

  const renderOptions = (nodes, level = 0) =>
    nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const indent = "\u00A0\u00A0".repeat(level);
      return (
        <React.Fragment key={node.id}>
          <option value={node.id} disabled={hasChildren}>
            {indent}{node.name}
          </option>
          {hasChildren && renderOptions(node.children, level + 1)}
        </React.Fragment>
      );
    });

  return (
    <>
      {/* Category Type Switch */}
      <div className="switch-container" style={{ margin: "0.5rem 0" }}>
        <label className="switch">
          <input
            type="checkbox"
            checked={categoryType}
            onChange={() => setCategoryType(!categoryType)}
          />
          <span className="slider"></span>
        </label>
        <span style={{ marginLeft: "0.5rem" }}>
          {categoryType ? "Personal" : "Shop"}
        </span>
      </div>

      {/* Core Category */}
      <label>Select Core Category</label>
      <select
        value={selectedCore}
        className={styles.modalFormInput}
        onChange={(e) => setSelectedCore(e.target.value)}
      >
        <option value="">--Select Core Category--</option>
        {availableCoreCategories.map((core) => (
          <option key={core} value={core}>{core}</option>
        ))}
      </select>

      {/* Leaf Category */}
      {selectedCore && categories.length > 0 && (
        <>
          <label>Select Category</label>
          <select
            value={selectedLeaf}
            className={styles.modalFormInput}
            onChange={onLeafChange}
          >
            <option value="">--Select--</option>
            {renderOptions(categories)}
          </select>
        </>
      )}

      {/* Income/Expense Split */}
      {selectedCategory && (selectedCategory.core_category === "Income" || selectedCategory.core_category === "Expense") && (
        <div>
          {splits.map((split, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: ".25rem" }} className={styles.linkRow}>
              <select
                value={split.account || ""}
                onChange={(e) => updateSplitRow(i, "account", e.target.value)}
                className={`${styles.modalFormInput} ${styles.linkLabelInput}`}
              >
                <option value="">--Select Account--</option>
                {accounts
                  .filter(acc => !splits.some((s, idx) => s.account === String(acc.id) && idx !== i))
                  .map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {formatAccountOption(acc)}
                    </option>
                  ))}
              </select>

              <input
                type="text"
                placeholder="Amount"
                value={split.amount}
                onChange={(e) => updateSplitRow(i, "amount", e.target.value)}
                className={`${styles.modalFormInput} ${styles.linkUrlInput}`}
              />

              <button type="button" onClick={() => removeSplitRow(i)} className={styles.removeButton}>
                <DeleteIcon className={styles.icon} />
              </button>
            </div>
          ))}

          {accounts.filter(acc => !splits.some(s => s.account === String(acc.id))).length > 0 && (
            <button
              type="button"
              onClick={addSplitRow}
              className={styles.buttonAddLink}
              style={{ marginTop: "0.25rem" }}
            >
              Add More Account
            </button>
          )}
        </div>
      )}

      {/* Recurring Checkbox */}
      <label className={styles.uiCheckbox}>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={() => setIsRecurring(!isRecurring)}
        />
        <span></span>
        Recurring Transaction
      </label>

      {/* Recurring Fields */}
      {isRecurring && (
        <>
          <label style={{ marginTop: "0.25rem", display: "block" }}>Recurring Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className={`${styles.modalFormInput} ${styles.linkLabelInput}`}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <label>Next Due Date</label>
          <input
            type="date"
            value={nextDueDate || ""}
            onChange={(e) => setNextDueDate(e.target.value)}
            className={styles.modalFormInput}
          />

          <label className={styles.uiCheckbox} style={{ marginTop: ".25rem" }}>
            <input
              type="checkbox"
              checked={useDueRange}
              onChange={(e) => {
                setUseDueRange(e.target.checked);
                if (!e.target.checked) {
                  setDueRangeStart("");
                  setDueRangeEnd("");
                }
              }}
            />
            <span></span>
            Use Due Range
          </label>

          {useDueRange && (
            <>
              <label style={{ marginTop: "0.25rem", display: "block" }}>Due Range Start</label>
              <input
                type="date"
                value={dueRangeStart || ""}
                onChange={(e) => setDueRangeStart(e.target.value)}
                className={styles.modalFormInput}
              />

              <label>Due Range End</label>
              <input
                type="date"
                value={dueRangeEnd || ""}
                onChange={(e) => setDueRangeEnd(e.target.value)}
                className={styles.modalFormInput}
              />
            </>
          )}

          <label style={{ marginTop: "0.25rem", display: "block" }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.modalFormInput}
          >
            <option value="planned">Planned</option>
            <option value="paid">Paid</option>
          </select>

        </>
      )}
    </>
  );
}
