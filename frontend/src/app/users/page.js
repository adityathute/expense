"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchBar from "../components/SearchBar";  // Assuming you want to use SearchBar now
import UserDetailsPopup from "./components/UserDetailsPopup";
import AddUserForm from "./components/AddUserForm";
import "../users/styles.css"; // Import the CSS
import StyledTable from "../components/StyledTable";  // Import StyledTable

export default function Users() {
  const [services, setServices] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // ✅ State for filtered results
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Local search query state

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/users/");
      const data = await res.json();
      const updatedUsers = data.map(user => ({
        ...user,
        identifications: user.identifications || [], // Ensure it's always an array
      }));
      setFilteredUsers(updatedUsers);
      setUsers(updatedUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers(); // ✅ Re-fetch the user list when the component mounts
  }, []);

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

  const handleAddUser = async (userData) => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error:", data);
        alert("Error: " + JSON.stringify(data));
        return;
      }

      setShowForm(false);
      fetchUsers(); // ✅ Re-fetch the user list to update immediately
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Handle the search query change from SearchBar
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filteredUsers = users.filter((user) => {
      const lowerCaseQuery = query.toLowerCase();

      return (
        (user.name?.toLowerCase().includes(lowerCaseQuery) || false) ||
        (user.mobile_number?.includes(lowerCaseQuery) || false) ||
        (user.identifications?.some((id) => id.id_number?.includes(lowerCaseQuery)) || false)
      );
    });

    setFilteredUsers(filteredUsers); // Update filtered results
  };

  // Define headers for the UserTable
  const headers = [
    "Name",
    "Mobile",
    "ID"
  ];

  // Map the filteredUsers to rows for the table
  const rows = filteredUsers.map(user => (
    <tr key={user.id}>
      <td>
        <span className="user-link" onClick={() => setSelectedUser(user)}>
          {user.name}
        </span>
      </td>
      <td>{user.mobile_number}</td>
      <td>
        {user.identifications.length > 0
          ? user.identifications.map(id => `${id.id_type}: ${id.id_number}`).join(", ")
          : "N/A"}
      </td>
    </tr>
  ));

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Welcome to the Users</h1>

          {/* Search and Add User */}
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
          <div className="row-straight-container">
            <h3 className="row-straight-left">Accounts</h3>
            <button className="row-straight-right add-button" onClick={() => setShowForm(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg> Add
            </button>
          </div>
          {/* Show Add User Form */}
          {showForm && <AddUserForm onClose={() => setShowForm(false)} onAddUser={handleAddUser} />}

          {/* Use the StyledTable Component for displaying users */}
          <StyledTable headers={headers} rows={rows} emptyText="No users found." />
        </div>
      </div>

      {/* Use the Separate Popup Component */}
      {selectedUser && (
        <UserDetailsPopup
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
