// services/ServiceDetailsModal.js
"use client";

import React from "react";
import Modal from "../components/Modal";
import { ActiveIcon, InactiveIcon } from "../components/StatusIcons";

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete,
}) {
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
        <div className="service-details-row">
          <p className="service-fee">₹&nbsp;{service.service_fee ?? "0.00"}</p>
          <p className="required-time">
            {service.required_time_hours
              ? `${(service.required_time_hours / 24).toFixed(1)} days`
              : "—"}
          </p>
        </div>

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

        <p className="serviceDetailsItem">
          {service.description || "—"}
        </p>

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
