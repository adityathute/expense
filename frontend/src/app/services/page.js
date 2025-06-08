"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../services/ServicePage.css";
import StyledTable from "../components/StyledTable";
import SearchBar from "../components/SearchBar";
import BalanceCell from "../components/BalanceCell";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import React from 'react';
import Loader from "../components/Loder";


function findDepartmentPath(departments, targetId, path = []) {
  for (const dept of departments) {
    const currentPath = [...path, dept.id];
    if (dept.id === targetId) return currentPath;
    if (dept.children && dept.children.length > 0) {
      const childPath = findDepartmentPath(dept.children, targetId, currentPath);
      if (childPath) return childPath;
    }
  }
  return null;
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [serviceDepartments, setServiceDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showLinksSection, setShowLinksSection] = useState(false);

  const [newService, setNewService] = useState({
    name: "",
    descriptions: "",
    service_department_id: null,
    service_fee: 0,
    service_charge: 0,
    other_charge: 0,
    pages_required: 0,
    required_time_hours: 0,
    is_active: true,
    priority_level: 2,
    links: [],
  });

  const [selectedDepartmentPath, setSelectedDepartmentPath] = useState([]); // Stores IDs of selected departments in hierarchy
  const [newChildDepartmentName, setNewChildDepartmentName] = useState(''); // For adding new child

  const handleDynamicDepartmentChange = (index, value) => {
    const selectedId = value ? parseInt(value, 10) : null;
    const newPath = selectedDepartmentPath.slice(0, index + 1);
    if (selectedId) {
      newPath[index] = selectedId;
    }
    setSelectedDepartmentPath(newPath);
    setNewService((prev) => ({ ...prev, service_department_id: selectedId }));
    setNewChildDepartmentName(''); // Reset new child name when a new selection is made
  };

  const handleAddChildDepartment = async () => {
    if (!newChildDepartmentName.trim()) return;

    const parentId = selectedDepartmentPath[selectedDepartmentPath.length - 1];
    if (!parentId) {
      alert("Please select a parent department first.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/api/service-departments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChildDepartmentName,
          parent: parentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }

      const newDept = await response.json();
      setNewChildDepartmentName(''); // Clear input after successful addition
      await fetchServiceDepartments(); // Re-fetch departments to update dropdowns
      // Optionally, update the selected path to include the newly added department
      setSelectedDepartmentPath(prevPath => [...prevPath, newDept.id]);
      setNewService((prev) => ({ ...prev, service_department_id: newDept.id }));

    } catch (error) {
      alert("Error creating child service department: " + error.message);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchServiceDepartments();
  }, []);

  const fetchServices = () => {
    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setLoading(false); // Immediately stop loading
      })
      .catch(() => {
        setError("Error fetching services.");
        setLoading(false); // Immediately stop loading on error too
      });
  };

  const fetchServiceDepartments = () => {
    fetch("http://127.0.0.1:8001/api/service-departments/list/")
      .then((res) => res.json())
      .then(setServiceDepartments)
      .catch(() => setError("Error fetching service departments."));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue =
      ["service_department_id", "priority_level"].includes(name)
        ? parseInt(value, 10) || null
        : type === "number"
          ? parseFloat(value) || 0
          : value;

    setNewService((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validate name
    if (!newService.name?.trim()) {
      alert("Service name is required.");
      return;
    }

    // 2. Validate service department
    if (!newService.service_department_id) {
      alert("Please select a Service Department.");
      return;
    }

    // 3. Validate links
    const validLinks = [];
    let linkError = null;

    for (const link of newService.links) {
      const label = link.label?.trim();
      const url = link.url?.trim();

      if (!label && !url) {
        continue; // Skip completely empty entries
      }

      if (label && !url) {
        linkError = "You cannot add a label without a link.";
        break;
      }

      if (url) {
        try {
          new URL(url); // Check valid URL format
          validLinks.push({ label: label || "Apply Online", url });
        } catch {
          linkError = "Invalid URL format detected.";
          break;
        }
      }
    }

    if (linkError) {
      alert(linkError);
      return;
    }

    // Prepare data
    const serviceToSubmit = {
      ...newService,
      links: validLinks,
      description: description,
    };

    const method = editingService ? "PUT" : "POST";
    const url = editingService
      ? `http://127.0.0.1:8001/api/services/${editingService}/`
      : "http://127.0.0.1:8001/api/services/";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceToSubmit),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => Promise.reject(err));
        }
        return res.json();
      })
      .then(() => {
        fetchServices();
        resetForm();
        setSuccessMessage(editingService ? "Service updated!" : "Service added!");
        setTimeout(() => setSuccessMessage(""), 3000);
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
      service_department_id: service.service_department?.id,
      links: service.links && service.links.length > 0 ? service.links : [{ label: "", url: "" }],
    });

    // Show link section if there are existing links
    setShowLinksSection((service.links && service.links.length > 0) || false);

    // Recursively build the department path from the tree
    const departmentId = service.service_department?.id;
    if (departmentId && serviceDepartments.length > 0) {
      const path = findDepartmentPath(serviceDepartments, departmentId);
      setSelectedDepartmentPath(path || []);
    }

    setShowForm(true);
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
    if (!showLinksSection) {
      setShowLinksSection(true);
    }
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
      service_department_id: null,
      service_fee: 0,
      service_charge: 0,
      other_charge: 0,
      pages_required: 0,
      required_time_hours: 0,
      is_active: true,
      priority_level: 2,
      links: [],
    });
    setEditingService(null);
    setShowForm(false);
    setNewChildDepartmentName("");
    setSelectedDepartmentPath([]);
    setShowLinksSection(false);

  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-message">{error}</div>
      <button className="error-close" onClick={() => setError(null)}>×</button>
    </div>
  );

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          {successMessage && <div className="success-message">{successMessage}</div>}

          <HeaderWithNewButton
            title="Services"
            buttonLabel="Add Service"
            onClick={() => setShowForm(true)}
          />

          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service..."
          />

          <StyledTable
            headers={[
              "Service Name",
              "Service Department",
              "Service Charge",
              "Pages Required",
              "Required Time (days)",
              "Priority",
            ]}
            columns={[
              "name",
              "service_department",
              "service_fee",
              "pages_required",
              "required_time_hours",
              "priority_level",
            ]}
            data={filteredServices}
            emptyText="No services found."
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderCell={(row, column) => {
              if (column === "service_fee") {
                return <BalanceCell value={row.service_fee} />;
              }
              if (column === "priority_level") {
                const labels = { 1: "Low", 2: "Medium", 3: "High" };
                return labels[row.priority_level] || row.priority_level;
              }
              if (column === "required_time_hours") {
                const hours = row.required_time_hours ?? 0;
                const days = (hours / 24).toFixed(1);
                return `${days} days`;
              }
              if (column === "service_department") {
                return row.service_department?.name || "-";
              }
              return row[column] ?? "-";
            }}
          />

          {showForm && (
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" name="name" value={newService.name} onChange={handleInputChange} required />
                {formErrors.name && <div className="error-text">{formErrors.name}</div>}

              </label>

              <label>
                Description:
                <textarea
                  value={description ?? ""}  // Use empty string instead of null
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label>
                Service Fee:
                <input type="number" name="service_fee" value={newService.service_fee} onChange={handleInputChange} />
              </label>

              <label>
                Service Charge:
                <input type="number" name="service_charge" value={newService.service_charge} onChange={handleInputChange} />
              </label>

              <label>
                Other Charge:
                <input type="number" name="other_charge" value={newService.other_charge} onChange={handleInputChange} />
              </label>

              <label>
                Pages Required:
                <input type="number" name="pages_required" value={newService.pages_required} onChange={handleInputChange} />
              </label>

              <label>
                Required Time (hours):
                <input type="number" step="0.1" name="required_time_hours" value={newService.required_time_hours} onChange={handleInputChange} />
              </label>

              <label>
                Priority Level:
                <select name="priority_level" value={newService.priority_level} onChange={handleInputChange}>
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </label>

              <label>
                Service Department:
                <select
                  name="service_department_id"
                  value={selectedDepartmentPath[0] || ''}
                  onChange={(e) => handleDynamicDepartmentChange(0, e.target.value)}
                  style={{ paddingLeft: '4px' }}
                >
                  <option value="">Select Service Department</option>
                  {renderServiceDepartmentOptions(serviceDepartments, 0)}
                </select>
                {formErrors.service_department_id && <div className="error-text">{formErrors.service_department_id}</div>}
              </label>

              {selectedDepartmentPath.map((deptId, index) => {
                if (index === selectedDepartmentPath.length - 1) return null; // Skip the last selected department as it's the current one

                let currentDepartments = serviceDepartments;
                let parentDept = null;
                for (let i = 0; i <= index; i++) {
                  parentDept = currentDepartments.find(d => d.id === selectedDepartmentPath[i]);
                  if (parentDept && parentDept.children) {
                    currentDepartments = parentDept.children;
                  } else {
                    currentDepartments = [];
                    break;
                  }
                }

                if (currentDepartments.length === 0) return null; // No children to display

                return (
                  <label key={index + 1}>
                    Select Child Department:
                    <select
                      value={selectedDepartmentPath[index + 1] || ''}
                      onChange={(e) => handleDynamicDepartmentChange(index + 1, e.target.value)}
                      style={{ paddingLeft: '4px' }}
                    >
                      <option value="">Select Child Department</option>
                      {renderServiceDepartmentOptions(currentDepartments, 0)}
                    </select>
                  </label>
                );
              })}

              {selectedDepartmentPath.length > 0 && (() => {
                let lastSelectedDept = null;
                let currentDepartments = serviceDepartments;
                for (const id of selectedDepartmentPath) {
                  lastSelectedDept = currentDepartments.find(d => d.id === id);
                  if (lastSelectedDept && lastSelectedDept.children) {
                    currentDepartments = lastSelectedDept.children;
                  } else {
                    currentDepartments = [];
                    break;
                  }
                }

                if (lastSelectedDept && currentDepartments.length === 0) {
                  return (
                    <div className="add-child-department-section">
                      <h4>Add New Child Department to {lastSelectedDept.name}</h4>
                      <input
                        type="text"
                        placeholder="New Child Department Name"
                        value={newChildDepartmentName}
                        onChange={(e) => setNewChildDepartmentName(e.target.value)}
                      />
                      <button type="button" onClick={handleAddChildDepartment}>
                        Add Child Department
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              {showLinksSection && newService.links.length > 0 && (
                <>
                  <h4>Links</h4>
                  {newService.links.map((link, index) => (

                    <div key={index}>
                      <input
                        type="text"
                        placeholder="Label"
                        value={link.label}
                        onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                      />
                      <button type="button" onClick={() => removeLink(index)}>Remove</button>
                    </div>
                  ))}
                </>
              )}
              <button type="button" onClick={addLink}>Add Link</button>

              <button type="submit">{editingService ? "Update Service" : "Create Service"}</button>
              <button type="button" onClick={resetForm}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const renderServiceDepartmentOptions = (groups, level = 0) => {
  return groups.map(group => (
    <React.Fragment key={group.id}>
      <option value={group.id}>{"\u00A0".repeat(level * 4)}{group.name}</option>
      {group.children && group.children.length > 0 && renderServiceDepartmentOptions(group.children, level + 1)}
    </React.Fragment>
  ));
};
