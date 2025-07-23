"use client";

import React from "react";
import Modal from "../components/Modal";

export function DeleteSupportingDocModal({
  isOpen,
  onClose,
  onConfirm,
  doc,
}) {

  useEffect(() => {
  if (docToDelete) {
    console.log("🧪 docToDelete set, opening modal...");
    setShowDeleteModal(true);
  }
}, [docToDelete]);

  if (!doc) return null; // 🔒 Don't render if doc is not ready

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Supporting Document">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "2rem", color: "#f87171" }}>
          Are you sure you want to delete <strong>{doc.name}</strong>?
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button className="service-cancel-btn-delete" onClick={onClose}>
            Cancel
          </button>
          <button
            className="service-delete-btn"
            onClick={async () => {
              console.log("🧪 Deleting document:", doc);
              await onConfirm(); // Call parent handler
              console.log("✅ Delete confirmed");
            }}
          >
            🗑 Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
