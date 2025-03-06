"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    address: "",
    mobile_number: "",
    email: "",
    total_charge: 0,
    paid_charge: 0,
    services_used: [],
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/users/")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));

    fetch("http://127.0.0.1:8001/api/services/")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err));
      console.log("Fetched services:", services);

  }, []);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (service) => {
    if (!service || !service.id) return; // Ensure service has a valid ID

    setNewUser((prevUser) => {
        const existingService = prevUser.services_used.find((s) => s.service === service.id);
    
        let updatedServices;
        if (existingService) {
            updatedServices = prevUser.services_used.filter((s) => s.service !== service.id);
        } else {
            updatedServices = [
                ...prevUser.services_used,
                {
                    service: service.id,  // Ensure only valid ID is stored
                    service_name: service.name,
                    service_total_fees: Number(service.fees) || 0,
                    acknowledgment_number: `ACK-${Date.now()}`,
                    tracking_number: `TRK-${Date.now()}`,
                    amount: Number(service.fees) || 0,
                },
            ];
        }

        const newTotalCharge = updatedServices.reduce((sum, s) => sum + (Number(s.service_total_fees) || 0), 0);
        return { ...prevUser, services_used: updatedServices, total_charge: newTotalCharge };
    });
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure services_used only contains valid service IDs
    const formattedUser = {
        ...newUser,
        services_used: newUser.services_used
            .map(s => s.service) // Extract only service IDs
            .filter(id => id !== null && id !== undefined) // Remove null/undefined
    };

    console.log("Formatted Data Sent to API:", JSON.stringify(formattedUser, null, 2));

    const method = editingUser ? "PUT" : "POST";
    const url = editingUser
        ? `http://127.0.0.1:8001/api/users/${editingUser.id}/`
        : "http://127.0.0.1:8001/api/users/";

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formattedUser),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update user: ${errorText}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (editingUser) {
            setUsers(users.map(user => user.id === editingUser.id ? result : user));
        } else {
            setUsers([...users, result]);
        }

        handleCancel();
    } catch (error) {
        console.error("Error updating user:", error);
    }
};

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      address: user.address,
      mobile_number: user.mobile_number,
      email: user.email,
      total_charge: user.total_charge,
      paid_charge: user.paid_charge,
      services_used: user.services_used.map(service => ({
        service: service.service,
        service_name: service.service_name,
        service_total_fees: service.service_total_fees,
        acknowledgment_number: service.acknowledgment_number,
        tracking_number: service.tracking_number,
        amount: service.amount,
      })),
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setNewUser({
      name: "",
      address: "",
      mobile_number: "",
      email: "",
      total_charge: 0,
      paid_charge: 0,
      services_used: [],
    });
    setShowForm(false);
  };

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Users</h1>

          <button onClick={() => setShowForm(true)}>Add</button>

          {showForm && (
            <form onSubmit={handleSubmit}>
              <label>Name:
                <input type="text" name="name" onChange={handleChange} value={newUser.name} required />
              </label>
              <label>Address:
                <input type="text" name="address" onChange={handleChange} value={newUser.address} required />
              </label>
              <label>Mobile:
                <input type="text" name="mobile_number" onChange={handleChange} value={newUser.mobile_number} required />
              </label>
              <label>Email:
                <input type="email" name="email" onChange={handleChange} value={newUser.email} required />
              </label>
              <label>Charge:
                <input type="number" name="total_charge" value={newUser.total_charge} readOnly />
              </label>
              <label>Paid Charge:
                <input type="number" name="paid_charge" onChange={handleChange} value={newUser.paid_charge} required />
              </label>

              <fieldset>
                <legend>Services Used:</legend>
                {services.map((service) => (
                  <div key={service.id}>
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={newUser.services_used.some(s => s.service === service.id)}
                      onChange={() => handleServiceChange(service)}
                    />
                    <label htmlFor={`service-${service.id}`}>
                      {service.name} (Fees: {service.fees})
                    </label>
                  </div>
                ))}
              </fieldset>

              <button type="submit">{editingUser ? "Update User" : "Add User"}</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
          )}

          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Charge</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.mobile_number}</td>
                  <td>
                    <ul>
                      {user.services_used.map((service, index) => (
                        <li key={service.id || `service-${index}`}>
                          {service.service_name} (Fees: {service.service_total_fees}, Amount: {service.amount})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{user.total_charge}</td>
                  <td>{user.paid_charge}</td>
                  <td>{user.total_charge - user.paid_charge}</td>
                  <td></td>
                  {/* <td>
                    <button onClick={() => handleEdit(user)}>Edit</button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
