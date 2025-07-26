"use client";

import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { ActiveIcon, InactiveIcon } from "../components/StatusIcons";

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete,
}) {
  const [supportingDocs, setSupportingDocs] = useState([]);

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
          <p className="service-fee">
            ₹{" "}
            {Number(service.service_fee) % 1 === 0
              ? Number(service.service_fee)
              : Number(service.service_fee).toFixed(2)}
          </p>

          {service.required_time_hours ? (
            <div className="required-time">
              {(() => {
                const rawHours = Number(service.required_time_hours);
                const days = rawHours / 24;

                const isAlmostWhole = Math.abs(days - Math.round(days)) < 0.01;
                const displayDays = isAlmostWhole
                  ? `${Math.round(days)} days`
                  : `${days.toFixed(1)} days`;

                return (
                  <>
                    <p>{displayDays}</p>
                    <p className="required-date">
                      {new Date(Date.now() + rawHours * 60 * 60 * 1000).toLocaleDateString("en-GB")}
                    </p>
                  </>
                );
              })()}
            </div>
          ) : (
            <p className="required-time">—</p>
          )}
        </div>

        {(service.links?.length > 0 || supportingDocs.length > 0) && (
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
            <ul className="serviceDetailsLinkList">
              {supportingDocs.map((doc) => (
                <li key={doc.id}>
                  {doc.file ? (
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
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

        {/* === Required Documents === */}
        {service.requirements?.length > 0 && (
          <div className="serviceDetailsDocuments">
            <h4 className="serviceDetailsLabel">Documents:</h4>
            <ul className="serviceDetailsDocList">
              {service.requirements.map((req) => (
                <li key={req.id} className="serviceDetailsDocItem">
                  <div className="doc-item-header">
                    <strong>{req.document.name}</strong>
                    {req.requirement_type && (
                      <span className="requirementType">{req.requirement_type}</span>
                    )}
                  </div>
                  {req.document.additional_details && (
                    <div className="serviceDetailsNote">
                      Note: {req.document.additional_details}
                    </div>
                  )}
                </li>

              ))}
            </ul>
          </div>
        )}

        {/* === Description === */}
        <p className="serviceDetailsDescription">{service.description || "—"}</p>

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
