"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/users/")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShowUserDetails = (user) => {
    setSelectedUser(user);
    setIsEditing(false); // Ensure it's in view mode initially
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const capitalizedValue = capitalizeWords(value);
  
    if (isEditing) {
      setSelectedUser({ ...selectedUser, [name]: capitalizedValue });
    } else {
      setNewUser({ ...newUser, [name]: capitalizedValue });
    }
  };
  

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/users/${selectedUser.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u))); // Update list
        setIsEditing(false);
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async () => {
    const requestData = {
      name: newUser.name,
      mobile_number: newUser.mobile_number,
    };
  
    console.log("Sending request:", JSON.stringify(requestData, null, 2));
  
    try {
      const response = await fetch("http://localhost:8001/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Error Response:", response.status, data);
      } else {
        console.log("User added successfully:", data);
  
        // ✅ Update user list immediately
        setUsers([...users, data]);
  
        // ✅ Clear form fields
        setNewUser({ name: "", mobile_number: "" });
  
        // ✅ Close the popup
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };
  

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Users</h1>

          {/* Search and Add User */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="add-button" onClick={() => setShowForm(true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>

          {/* Add User Form */}
          {showForm && (
            <div className="modal">
              <div className="modal-content">
                <span className="close-button" onClick={() => setShowForm(false)}>
                  &times;
                </span>
                <h2>Add User</h2>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="mobile_number"
                  placeholder="Enter Mobile Number"
                  value={newUser.mobile_number}
                  onChange={handleInputChange}
                  required
                />
                <button onClick={handleAddUser}>Save</button>
              </div>
            </div>
          )}

          {/* User Table */}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="user-link" onClick={() => handleShowUserDetails(user)}>
                      {user.name}
                    </span>
                  </td>
                  <td>{user.mobile_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Popup */}
      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseDetails}>
              &times;
            </span>
            {isEditing ? (
              <>
                <h2>Edit User</h2>
                <input
                  type="text"
                  name="name"
                  value={selectedUser.name}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="mobile_number"
                  value={selectedUser.mobile_number}
                  onChange={handleInputChange}
                />
                <button className="save-button" onClick={handleSaveEdit}>
                  Save
                </button>
              </>
            ) : (
              <>
                <h2>{selectedUser.name}</h2>
                <p><strong>Address:</strong> {selectedUser.address || "N/A"}</p>
                <p><strong>Mobile:</strong> {selectedUser.mobile_number}</p>
                <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
                <p><strong>Total Charge:</strong> {selectedUser.total_charge}</p>
                <p><strong>Paid:</strong> {selectedUser.paid_charge}</p>
                <p><strong>Remaining:</strong> {selectedUser.total_charge - selectedUser.paid_charge}</p>
                <button className="edit-button" onClick={handleEditClick}>
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
