"use client";

import React from "react";
import Modal from "../components/Modal";

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
  accountId,
  accountName,
  type = "soft", // "soft" = recycle bin, "hard" = permanent
}) {
  if (!isOpen) return null;

  const message =
    type === "soft"
      ? `Are you sure you want to move "${accountName}" to the Recycle Bin?`
      : `Are you sure you want to permanently delete "${accountName}"? This cannot be undone.`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button className="service-cancel-btn-delete" onClick={onClose}>
            Cancel
          </button>
          <button
            className="service-delete-btn"
            disabled={!accountId}
            onClick={() => onDelete(accountId)}
          >
            🗑 Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
