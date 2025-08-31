"use client";

import React from "react";
import Modal from "../components/Modal";

export default function DeleteCategoryModal({ isOpen, onClose, onDelete, categoryId, categoryName }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Category">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>
          Are you sure you want to delete <strong>{categoryName}</strong>?
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
