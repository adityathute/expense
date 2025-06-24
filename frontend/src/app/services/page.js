// services/page.js
"use client";

import { useEffect, useState } from "react";
// import "../services/ServicePage.css";
import StyledTable from "../components/StyledTable";
import SearchBar from "../components/SearchBar";
import BalanceCell from "../components/BalanceCell";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import React from 'react';
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ServiceForm from "./ServiceForm";
import { parseISO, format } from "date-fns";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLinksSection, setShowLinksSection] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    service_fee: 0,
    service_charge: 0,
    other_charge: 0,
    pages_required: 0,
    required_time_hours: 0,
    is_active: true,
    links: [{ label: "", url: "" }],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    try {
      const cleaned = dateString.includes(".")
        ? dateString.split(".")[0]
        : dateString;

      const isoString = cleaned.replace(" ", "T");
      const date = new Date(isoString);

      if (isNaN(date.getTime())) return "—";

      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const fetchServices = () => {
    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching services.");
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) || 0 : value;

    setNewService((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingService ? "PUT" : "POST";
    const url = editingService
      ? `http://127.0.0.1:8001/api/services/${editingService}/`
      : "http://127.0.0.1:8001/api/services/";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err));
        }
        return res.json();
      })
      .then((data) => {
        fetchServices();
        resetForm();
        setSuccessMessage(editingService ? "Service updated!" : "Service added!");
        setTimeout(() => setSuccessMessage("", 3000));
      })
      .catch((err) => {
        const errorMessage = err.detail || err.message || "Error saving service.";
        alert(errorMessage);
      });
  };

  const handleEdit = (service) => {
    setEditingService(service.id);
    setNewService({
      ...service,
      links: service.links ?? [],
    });
    setShowForm(true);
    setShowLinksSection(service.links && service.links.length > 0); // shows only if links exist
  };


  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    fetch(`http://127.0.0.1:8001/api/services/${id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err));
        }
        fetchServices();
      })
      .catch((err) => {
        const errorMessage = err.detail || err.message || "Error deleting service.";
        alert(errorMessage);
      });
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...newService.links];
    updatedLinks[index][field] = value;
    setNewService((prev) => ({ ...prev, links: updatedLinks }));
  };

  const addLink = () => {
    if (!showLinksSection) setShowLinksSection(true);
    setNewService((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "" }],
    }));
  };


  const removeLink = (index) => {
    const updatedLinks = [...newService.links];
    updatedLinks.splice(index, 1);
    setNewService((prev) => ({ ...prev, links: updatedLinks }));
  };
  const resetForm = () => {
    setNewService({
      name: "",
      description: "",
      service_fee: 0,
      service_charge: 0,
      other_charge: 0,
      pages_required: 0,
      required_time_hours: 0,
      is_active: true,
      links: [],
    });
    setEditingService(null);
    setShowForm(false);
    setShowLinksSection(false); // <- reset it here too
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;
  // if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {successMessage && <div className="success-message">{successMessage}</div>}

      <HeaderWithNewButton
        title="Services"
        buttonLabel="Add Service"
        onClick={() => {
          resetForm();
          setShowForm(true);
          setShowLinksSection(false);
        }}
      />

      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search service..."
      />

      <StyledTable
        headers={[
          "Service Name",
          "Service Charge",
          "Pages Required",
          "Required Time (days)",
        ]}
        columns={[
          "name",
          "service_fee",
          "pages_required",
          "required_time_hours",
        ]}
        data={filteredServices}
        emptyText="No services found."
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderCell={(row, column) => {
          if (column === "name") {
            return (
              <button
                onClick={() => {
                  setSelectedService(row);
                  setShowDetailsModal(true);
                }}
                className="text-blue-400 hover:underline"
              >
                {row.name}
              </button>
            );
          }

          if (column === "service_fee") {
            return <BalanceCell value={row.service_fee} />;
          }
          if (column === "required_time_hours") {
            const hours = row.required_time_hours ?? 0;
            const days = (hours / 24).toFixed(1);
            return `${days} days`;
          }
          return row[column] ?? "-";
        }}
      />

      <Modal isOpen={showForm} onClose={resetForm}>
        <ServiceForm
          newService={newService}
          description={newService.description}
          setDescription={(desc) => setNewService(prev => ({ ...prev, description: desc }))}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleLinkChange={handleLinkChange}
          addLink={addLink}
          removeLink={removeLink}
          editingService={editingService}
          resetForm={resetForm}
          formErrors={{}} // optional, can implement later
          showLinksSection={showLinksSection}
          setShowLinksSection={setShowLinksSection}
        />
      </Modal>
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        {selectedService && (
<div className="serviceDetailsContainer">
  <h2 className="serviceDetailsTitle">{selectedService.name}</h2>

  <div>
    <p className="serviceDetailsItem"><strong>Description:</strong><br />{selectedService.description || "—"}</p>
    <p className="serviceDetailsItem"><strong>Service Fee:</strong> ₹{selectedService.service_fee ?? "0.00"}</p>
    <p className="serviceDetailsItem"><strong>Service Charge:</strong> ₹{selectedService.service_charge ?? "0.00"}</p>
    <p className="serviceDetailsItem"><strong>Other Charge:</strong> ₹{selectedService.other_charge ?? "0.00"}</p>
    <p className="serviceDetailsItem"><strong>Pages Required:</strong> {selectedService.pages_required}</p>
    <p className="serviceDetailsItem"><strong>Estimated Time:</strong>
      {selectedService.estimated_time_seconds
        ? ` ${Math.round(selectedService.estimated_time_seconds / 60)} minutes`
        : " —"}
    </p>
    <p className="serviceDetailsItem"><strong>Required Time:</strong>
      {selectedService.required_time_hours
        ? ` ${(selectedService.required_time_hours / 24).toFixed(1)} days`
        : " —"}
    </p>
    <p className="serviceDetailsItem"><strong>Status:</strong>
      <span className={`serviceDetailsStatus ${selectedService.is_active ? "text-green-400" : "text-red-400"}`}>
        {selectedService.is_active ? "Active ✅" : "Inactive ❌"}
      </span>
    </p>
    <p className="serviceDetailsItem"><strong>Deleted:</strong>
      <span className={`serviceDetailsStatus ${selectedService.is_deleted ? "text-red-400" : "text-green-400"}`}>
        {selectedService.is_deleted ? "Yes" : "No"}
      </span>
    </p>
    <p className="serviceDetailsItem"><strong>Created At:</strong> {formatDate(selectedService.created_at)}</p>
    <p className="serviceDetailsItem"><strong>Updated At:</strong> {formatDate(selectedService.updated_at)}</p>
  </div>

  {selectedService.links && selectedService.links.length > 0 && (
    <div className="serviceDetailsLinks">
      <span className="serviceDetailsLinksTitle">Related Links:</span>
      <ul className="serviceDetailsLinkList">
        {selectedService.links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label || link.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

        )}
      </Modal>

    </div>
  );
}
