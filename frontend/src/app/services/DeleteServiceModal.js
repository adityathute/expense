// services/DeleteServiceModal.js
"use client";

import React from "react";
import Modal from "../components/Modal";

export default function DeleteServiceModal({
  isOpen,
  onClose,
  onDelete,
  service,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Service">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>
          Are you sure you want to delete <strong>{service?.name}</strong>?
        </p>
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
            🗑 Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
