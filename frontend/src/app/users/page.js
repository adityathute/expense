"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchBar from "../components/SearchBar";
import UserDetailsPopup from "./components/UserDetailsPopup";
import AddUserForm from "./components/AddUserForm";
// import "../users/styles.css";
import StyledTable from "../components/StyledTable";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";

export default function Users() {
  const [services, setServices] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    fetchUsers();
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
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

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

    setFilteredUsers(filteredUsers);
  };

  const headers = ["Name", "Mobile", "ID"];
  const columns = ["name", "mobile_number", "id"];

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">

          <HeaderWithNewButton
            title="Users"
            buttonLabel="Add User"
            onClick={() => setShowForm(true)}
          />

          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
          {showForm && <AddUserForm onClose={() => setShowForm(false)} onAddUser={handleAddUser} />}

          <StyledTable
            headers={headers}
            columns={columns}
            data={filteredUsers}
            emptyText="No users found."
            renderCell={(user, col) => {
              if (col === "name") {
                return (
                  <span className="user-link" onClick={() => setSelectedUser(user)}>
                    {user.name}
                  </span>
                );
              }
              if (col === "mobile_number") return user.mobile_number;
              if (col === "id") {
                return user.identifications?.length > 0
                  ? user.identifications.map((id) => `${id.id_type}: ${id.id_number}`).join(", ")
                  : "N/A";
              }
              return "-";
            }}
          />
        </div>
      </div>

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
