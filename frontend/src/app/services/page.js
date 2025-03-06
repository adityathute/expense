"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../services/ServicePage.css"; // Import the CSS

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState({
    acknowledgment_number: "",
    tracking_number: "",
    amount: 0,
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionSuccessMessage, setTransactionSuccessMessage] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/user-services/")  // Update with actual API
      .then((res) => res.json())
      .then((data) => {
        // Sort transactions in descending order by ID (assuming higher ID = latest transaction)
        const sortedTransactions = data.sort((a, b) => b.id - a.id);
        // Show only the last 10 transactions
        setTransactions(sortedTransactions.slice(0, 10));
      })
      .catch((err) => console.error("Error fetching transactions:", err));
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8001/api/users/")  // Update with actual user API
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  };

  const openTransactionForm = (service) => {
    setSelectedService(service);
    setShowTransactionForm(true);
  };

  const handleTransactionChange = (e) => {
    setTransactionDetails({ ...transactionDetails, [e.target.name]: e.target.value });
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

  const submitTransaction = (e) => {
    e.preventDefault();
  
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }
  
    fetch("http://127.0.0.1:8001/api/user-services/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: selectedUser,
        service: selectedService.id,
        acknowledgment_number: transactionDetails.acknowledgment_number,
        tracking_number: transactionDetails.tracking_number,
        amount: transactionDetails.amount,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((newTransaction) => {
        // Update transactions list instantly
        setTransactions((prevTransactions) => [newTransaction, ...prevTransactions.slice(0, 9)]);
  
        // Show success message
        setTransactionSuccessMessage("Transaction added successfully!");
  
        // Hide message after 5 seconds
        setTimeout(() => {
          setTransactionSuccessMessage("");
        }, 5000);
  
        setShowTransactionForm(false);
      })
      .catch((err) => alert("Error adding transaction: " + err.message));
  };


  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
        {transactionSuccessMessage && (
  <div className="success-message">{transactionSuccessMessage}</div>
)}

          <h1>Available Services</h1>
          <div className="tables-container">
            <div className="services-table">
              <h2>Services</h2>
              <input
                type="text"
                placeholder="Search service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <table>
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Total Fees</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services
                    .filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((service) => (
                      <tr key={service.id}>
                        <td>{service.name}</td>
                        <td>₹{service.total_fees}</td>
                        <td>
                          <button className="use-client-btn" onClick={() => openTransactionForm(service)}>
                            Use Client
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {showTransactionForm && selectedService && (
            <div className="modal">
              <h2>Use Client for {selectedService.name}</h2>
              <form onSubmit={submitTransaction}>
                <label>User:</label>
                <select onChange={(e) => setSelectedUser(e.target.value)} required>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.mobile_number})</option>
                  ))}
                </select>

                <label>Acknowledgment Number:</label>
                <input type="text" name="acknowledgment_number" onChange={handleTransactionChange} required />

                <label>Tracking Number:</label>
                <input type="text" name="tracking_number" onChange={handleTransactionChange} required />

                <label>Amount:</label>
                <input type="number" name="amount" onChange={handleTransactionChange} required />

                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowTransactionForm(false)}>Cancel</button>
              </form>
            </div>
          )}
          
            <div className="transactions-table">
              <h2>Transactions</h2>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Service</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.user_name}</td>
                      <td>{transaction.service_name}</td>
                      <td>₹{transaction.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
                <button type="submit">{editingService ? "Update Service" : "Create Service"}</button>
                <button type="button" onClick={resetForm}>Cancel</button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
