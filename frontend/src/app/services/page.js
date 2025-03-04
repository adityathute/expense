"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    agent_fee: 0,
    service_charge: 0,
    total_fees: 0,
    required_documents: "",
  });
  const [remainingCharge, setRemainingCharge] = useState(0);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false); // State to show/hide form

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = parseFloat(value) || 0;

    setNewService((prev) => {
      let updatedService = { 
        ...prev, 
        [name]: name === "name" || name === "description" || name === "required_documents" ? value : parseFloat(value) || 0,
      };

      if (name === "total_fees") {
        if (prev.service_charge > 0) {
          updatedService.agent_fee = updatedValue - prev.service_charge;
        } else if (prev.agent_fee > 0) {
          updatedService.service_charge = updatedValue - prev.agent_fee;
        }
      } else if (name === "service_charge") {
        updatedService.agent_fee = prev.total_fees - updatedValue;
      } else if (name === "agent_fee") {
        updatedService.service_charge = prev.total_fees - updatedValue;
      }

      return updatedService;
    });
  };

  const createService = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8001/api/services/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newService, remaining_charge: remainingCharge }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create service");
        return res.json();
      })
      .then((data) => {
        setServices([...services, data]);
        resetForm();
      })
      .catch((err) => alert(err.message));
  };

  const editService = (service) => {
    setEditingService(service.id);
    setNewService({
      name: service.name,
      description: service.description,
      agent_fee: service.agent_fee,
      service_charge: service.service_charge,
      total_fees: service.total_fees,
      required_documents: service.required_documents,
    });
    setShowForm(true); // Show form when editing
  };

  const updateService = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:8001/api/services/${editingService}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newService, remaining_charge: remainingCharge }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update service");
        return res.json();
      })
      .then((updatedService) => {
        setServices(
          services.map((service) =>
            service.id === editingService ? updatedService : service
          )
        );
        resetForm();
      })
      .catch((err) => alert(err.message));
  };

  const resetForm = () => {
    setNewService({
      name: "",
      description: "",
      agent_fee: 0,
      service_charge: 0,
      total_fees: 0,
      required_documents: "",
    });
    setRemainingCharge(0);
    setEditingService(null);
    setShowForm(false); // Hide form after reset
  };

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Available Services</h1>

          {/* Button to Show Add Service Form */}
          <button onClick={() => setShowForm(true)} style={{ marginBottom: "10px" }}>
            Add Service
          </button>

          {/* Show form only if showForm is true */}
          {showForm && (
            <div className="create-form">
              <h2>{editingService ? "Edit Service" : "Add New Service"}</h2>
              <form onSubmit={editingService ? updateService : createService}>
                <label>
                  Name:
                  <input type="text" name="name" value={newService.name} onChange={handleInputChange} required />
                </label>
                <label>
                  Description:
                  <textarea name="description" value={newService.description} onChange={handleInputChange} />
                </label>
                <label>
                  Agent Fee:
                  <input type="number" name="agent_fee" value={newService.agent_fee} onChange={handleInputChange} />
                </label>
                <label>
                  Service Charge:
                  <input type="number" name="service_charge" value={newService.service_charge} onChange={handleInputChange} />
                </label>
                <label>
                  Total Fees:
                  <input type="number" name="total_fees" value={newService.total_fees} onChange={handleInputChange} />
                </label>
                <label>
                  Required Documents:
                  <input type="text" name="required_documents" value={newService.required_documents} onChange={handleInputChange} />
                </label>
                <button type="submit">{editingService ? "Update Service" : "Create Service"}</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </form>
            </div>
          )}

          {/* Services Table */}
          <table border="1">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Agent Fee</th>
                <th>Service Charge</th>
                <th>Total Fees</th>
                <th>Required Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.name}</td>
                    <td>{service.description}</td>
                    <td>₹{service.agent_fee}</td>
                    <td>₹{service.service_charge}</td>
                    <td>₹{service.total_fees}</td>
                    <td>{service.required_documents}</td>
                    <td>
                      <button onClick={() => editService(service)}>Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>No services available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
