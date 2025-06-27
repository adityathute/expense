// services/page.js
"use client";

import { useEffect, useState } from "react";
import StyledTable from "../components/StyledTable";
import SearchBar from "../components/SearchBar";
import BalanceCell from "../components/BalanceCell";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import React from 'react';
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import ServiceForm from "./ServiceForm";
import Pagination from "../components/Pagination";
import DeleteServiceModal from "./DeleteServiceModal";
import ServiceDetailsModal from "./ServiceDetailsModal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 30;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [returnToDetails, setReturnToDetails] = useState(false);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredServices.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + entriesPerPage);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    service_fee: "",
    service_charge: "",
    other_charge: "",
    pages_required: "",
    required_time_hours: "",
    links: [],
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
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      })
      .then(() => {
        fetchServices();
        resetForm();
        setSuccessMessage(editingService ? "Service updated!" : "Service added!");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Server error response:", err);
        alert("Error: " + JSON.stringify(err));
      });
  };

  const handleEdit = (service) => {
    setEditingService(service.id);
    setNewService({
      ...service,
      links: service.links ?? [],
    });
    setShowForm(true);
    setShowLinksSection(service.links && service.links.length > 0);
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8001/api/services/${id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) return res.json().then(err => Promise.reject(err));
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
    setShowLinksSection(false);

    if (returnToDetails) {
      setShowDetailsModal(true);
      setReturnToDetails(false);
    }
  };

  if (loading) return <Loader />;

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
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Search service..."
      />

      {filteredServices.length > 0 ? (
        <>
          <StyledTable
            headers={["Service Name", "Service Charge", "Required Time (days)"]}
            columns={["name", "service_fee", "required_time_hours"]}
            data={paginatedServices}
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

          {filteredServices.length > entriesPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No services found.
        </div>
      )}

      <Modal isOpen={showForm} onClose={resetForm} title={editingService ? "Update Service" : "Add Service"}>
        <ServiceForm
          newService={newService}
          setNewService={setNewService}
          description={newService.description}
          setDescription={(desc) => setNewService(prev => ({ ...prev, description: desc }))}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          handleLinkChange={handleLinkChange}
          addLink={addLink}
          removeLink={removeLink}
          editingService={editingService}
          resetForm={resetForm}
          formErrors={{}}
          showLinksSection={showLinksSection}
          setShowLinksSection={setShowLinksSection}
        />
      </Modal>

      <ServiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        service={selectedService}
        onEdit={(service) => {
          handleEdit(service);
          setReturnToDetails(true);
        }}
        onDelete={(service) => {
          setServiceToDelete(service);
          setShowDeleteModal(true);
          setReturnToDetails(true);
        }}
      />

      <DeleteServiceModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          if (returnToDetails) {
            setShowDetailsModal(true);
            setReturnToDetails(false);
          }
        }}
        onDelete={(id) => {
          handleDelete(id);
          setShowDeleteModal(false);
          setReturnToDetails(false);
        }}
        service={serviceToDelete}
        returnToDetails={returnToDetails}
      />
    </div>
  );
}
