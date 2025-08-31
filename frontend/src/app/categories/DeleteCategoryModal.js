"use client";

import React from "react";
import Modal from "../components/Modal";

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onDelete,
  categoryId,
  categoryName,
  type = "soft", // soft or hard
}) {
  if (!isOpen) return null;

  const message =
    type === "soft"
      ? `Are you sure you want to move "${categoryName}" to the recycle bin?`
      : `Are you sure you want to permanently delete "${categoryName}"? This cannot be undone.`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Category">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button className="service-cancel-btn-delete" onClick={onClose}>
            Cancel
          </button>
          <button
            className="service-delete-btn"
            disabled={!categoryId}
            onClick={() => onDelete(categoryId)}
          >
            🗑 Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
