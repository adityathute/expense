"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../services/ServicePage.css";
import StyledTable from "../components/StyledTable";  // relative path
import SearchBar from "../components/SearchBar";  // Import the SearchBar component
import BalanceCell from "../components/BalanceCell"; // Import here

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    category: "",
    service_charge: 0,
    pages_required: 0,
    estimated_time_seconds: 0,
    is_active: true,
    priority_level: 2,
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
      .catch((err) => {
        setError("Error fetching services.");
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingService ? "PUT" : "POST";
    const url = editingService
      ? `http://127.0.0.1:8001/api/services/${editingService}/`
      : "http://127.0.0.1:8001/api/services/";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    })
      .then((res) => res.json())
      .then(() => {
        fetchServices();
        resetForm();
        setSuccessMessage(editingService ? "Service updated!" : "Service added!");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch(() => alert("Error saving service."));
  };

  const handleEdit = (service) => {
    setEditingService(service.id);
    setNewService({ ...service });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    fetch(`http://127.0.0.1:8001/api/services/${id}/`, {
      method: "DELETE",
    })
      .then(() => fetchServices())
      .catch(() => alert("Error deleting service."));
  };

  const resetForm = () => {
    setNewService({
      name: "",
      description: "",
      category: "",
      service_charge: 0,
      pages_required: 0,
      estimated_time_seconds: 0,
      is_active: true,
      priority_level: 2,
    });
    setEditingService(null);
    setShowForm(false);
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          {successMessage && <div className="success-message">{successMessage}</div>}

          <h1>Available Services</h1>

          {/* Add the SearchBar component here */}
          <SearchBar 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search service..."
          />

<StyledTable
  headers={[
    "Service Name",
    "Category",
    "Service Charge",
    "Pages Required",
    "Estimated Time (s)",
    "Priority",
  ]}
  columns={[
    "name",
    "category",
    "service_charge",
    "pages_required",
    "estimated_time_seconds",
    "priority_level",
  ]}
  data={filteredServices}
  emptyText="No services found."
  onEdit={handleEdit}
  onDelete={handleDelete}
  renderCell={(row, column) => {
    if (column === "service_charge") {
      return <BalanceCell value={row.service_charge} />;
    }
    if (column === "priority_level") {
      const labels = { 1: "Low", 2: "Medium", 3: "High" };
      return labels[row.priority_level] || row.priority_level;
    }
    return row[column] ?? "-";
  }}
/>


          <button onClick={() => setShowForm(true)}>Add Service</button>

          {showForm && (
            <form onSubmit={handleSubmit}>
              <label>Name: <input type="text" name="name" value={newService.name} onChange={handleInputChange} required /></label>
              <label>Description: <textarea name="description" value={newService.description} onChange={handleInputChange} /></label>
              <label>Category: <input type="text" name="category" value={newService.category} onChange={handleInputChange} /></label>
              <label>Service Charge: <input type="number" name="service_charge" value={newService.service_charge} onChange={handleInputChange} /></label>
              <label>Pages Required: <input type="number" name="pages_required" value={newService.pages_required} onChange={handleInputChange} /></label>
              <label>Estimated Time (s): <input type="number" name="estimated_time_seconds" value={newService.estimated_time_seconds} onChange={handleInputChange} /></label>
              <label>Priority Level:
                <select name="priority_level" value={newService.priority_level} onChange={handleInputChange}>
                  <option value="1">Low</option>
                  <option value="2">Medium</option>
                  <option value="3">High</option>
                </select>
              </label>
              <button type="submit">{editingService ? "Update Service" : "Create Service"}</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
