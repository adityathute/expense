"use client";

import React from "react";
import Modal from "../components/Modal";

export default function DeleteServiceModal({
  isOpen,
  onClose,
  onDelete,
  service,
  type = "soft", // "soft" = move to recycle bin, "hard" = permanently delete
}) {
  // Dynamic text
  const message =
    type === "soft"
      ? `Are you sure you want to move "${service?.name}" to the Recycle Bin?`
      : `Are you sure you want to permanently delete "${service?.name}"? This action cannot be undone.`;

  const buttonText = type === "soft" ? "Move to Recycle Bin" : "🗑 Yes, Permanently Delete";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Service">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button className="service-cancel-btn-delete" onClick={onClose}>
            Cancel
          </button>
          <button
            className="service-delete-btn"
            onClick={() => {
              onDelete(service?.id);
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
