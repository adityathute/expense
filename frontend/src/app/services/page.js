"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Services() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", description: "" });

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8001/api/services/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });
    if (response.ok) {
      const data = await response.json();
      setServices([...services, data]);
      setNewService({ name: "", description: "" });
    }
  };

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Welcome to the Services</h1>
          <p>Manage your Services like Election Card, Pancard, Farmer ID Cards.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            />
            <button type="submit">Add Service</button>
          </form>

          <ul>
            {services.map((service) => (
              <li key={service.id}>{service.name} - {service.description}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
