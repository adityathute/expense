"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchUsers from "./components/searchUsers";
import UserTable from "./components/UserTable";
import UserDetailsPopup from "./components/UserDetailsPopup";
import AddUserForm from "./components/AddUserForm";
import "../users/styles.css"; // Import the CSS

export default function Users() {
  const [filteredUsers, setFilteredUsers] = useState([]); // ✅ State for filtered results
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/users/");
      const data = await res.json();
      const updatedUsers = data.map(user => ({
        ...user,
        identifications: user.identifications || [],
      }));
      setFilteredUsers(updatedUsers);
      setUsers(updatedUsers);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/users/")
      .then((res) => res.json())
      .then((data) => {
        // Ensure identifications are included in each user
        const updatedUsers = data.map(user => ({
          ...user,
          identifications: user.identifications || [] // Ensure it's always an array
        }));
        setFilteredUsers(updatedUsers); // ✅ Initially, show all users
        setUsers(updatedUsers);
        fetchUsers(); // Fetch users when the component mounts
      })
      .catch((err) => console.error(err));
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

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Users</h1>

          {/* Search and Add User */}
          <div className="search-container">
            {/* ✅ Use the new SearchUsers component */}
            <SearchUsers users={users} onSearchResults={setFilteredUsers} />
            <button className="add-button" onClick={() => setShowForm(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Add</button>
          </div>

          {/* Show Add User Form */}
          {showForm && <AddUserForm onClose={() => setShowForm(false)} onAddUser={handleAddUser} />}

          {/* ✅ Use the UserTable Component */}
          <UserTable users={filteredUsers} onSelectUser={setSelectedUser} />

        </div>
      </div>
      {/* ✅ Use the Separate Popup Component */}
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
