"use client";

import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { ActiveIcon, InactiveIcon } from "../components/StatusIcons";
import styles from "../styles/components/modalForm.module.css";
import { DeleteIcon } from "../components/Icons";

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete,
}) {
  const [supportingDocs, setSupportingDocs] = useState([]);
  const handleDeleteSupportingDoc = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`http://localhost:8001/api/supporting-documents/${docId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      // Remove from local state
      setSupportingDocs((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete document.");
    }
  };
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchSupportingDocs = async () => {
      if (!service?.id) return;

      try {
        const res = await fetch(
          `http://localhost:8001/api/supporting-documents/?service=${service.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch supporting documents");

        const data = await res.json();
        setSupportingDocs(data);
      } catch (err) {
        console.error("Error fetching supporting documents:", err);
        setSupportingDocs([]); // fallback
      }
    };

    fetchSupportingDocs();
  }, [service]);

  if (!service) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          {service.name}
          {service.is_active ? (
            <ActiveIcon className="icon icon-green" />
          ) : (
            <InactiveIcon className="icon icon-red" />
          )}
        </span>
      }
    >
      <div className="serviceDetailsContainer space-y-4">
        {/* === Basic Details === */}
        <div className="service-details-row">
          <p className="service-fee">₹&nbsp;{service.service_fee ?? "0.00"}</p>
          <p className="required-time">
            {service.required_time_hours
              ? `${(service.required_time_hours / 24).toFixed(1)} days`
              : "—"}
          </p>
        </div>

        {/* === Links === */}
        {service.links?.length > 0 && (
          <div className="serviceDetailsLinks">
            <ul className="serviceDetailsLinkList">
              {service.links.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === Required Documents === */}
        {service.requirements?.length > 0 && (
          <div className="serviceDetailsDocuments">
            <h4 className="serviceDetailsLabel">Required Documents:</h4>
            <ul className="serviceDetailsDocList">
              {service.requirements.map((req) => (
                <li key={req.id} className="serviceDetailsDocItem">
                  <strong>{req.document.name}</strong>
                  {req.document.additional_details && (
                    <div className="serviceDetailsDescription">
                      Note: {req.document.additional_details}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === Supporting Documents === */}
        {supportingDocs.length > 0 && (
          <div className="serviceDetailsDocuments">
            <h4 className="serviceDetailsLabel">Supporting Documents:</h4>
            <ul className="serviceDetailsDocList flex flex-wrap gap-4">
              {supportingDocs.map((doc) => (
                <li key={doc.id} className="serviceDetailsDocItem">
                  {doc.file ? (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <strong>{doc.name}</strong>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* === Description === */}
        <p className="serviceDetailsItem">{service.description || "—"}</p>

        {/* === Actions === */}
        <div className="service-details-actions">
          <button
            className="service-edit-btn"
            onClick={() => {
              onEdit(service);
              onClose();
            }}
          >
            ✎ Edit Service
          </button>
          <button
            className="service-delete-btn"
            onClick={() => {
              onDelete(service);
              onClose();
            }}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
