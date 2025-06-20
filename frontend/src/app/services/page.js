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

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLinksSection, setShowLinksSection] = useState(false);

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

    </div>
  );
}
