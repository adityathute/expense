// users/page.js
"use client";

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import UserDetailsPopup from "./components/UserDetailsPopup";
import AddUserForm from "./components/AddUserForm";
import StyledTable from "../components/StyledTable";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function Users() {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

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

  const handleSaveEdit = async (userData) => {
    if (!editingUser) return;

    try {
      const payload = {
        name: userData.name,
        mobile_number: userData.mobile_number,
        gender: userData.gender,
        user_type: userData.user_type,
        identifications: userData.identifications.map(id => ({
          id_name: id.id_name,  // make sure this is included
          id_number: id.id_number,
          is_deleted: id.is_deleted || false,
          id: id.id || undefined, // for updates
        })),
      };

      const response = await fetch(
        `http://127.0.0.1:8001/api/users/${editingUser.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        setFilteredUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        setEditingUser(null);
        setSelectedUser(null);
        setShowModal(false);
      } else {
        const errorData = await response.json();
        console.error("Failed to update user:", response.status, errorData);
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
        (user.identifications?.some((id) => id.id_number?.toLowerCase().includes(lowerCaseQuery)) || false)
      );
    });

    setFilteredUsers(filteredUsers);
    setCurrentPage(1);
  };

  const headers = ["Name", "Mobile", "ID"];
  const columns = ["name", "mobile_number", "id"];

  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div>
      <HeaderWithNewButton
        title="Users"
        buttonLabel="Add User"
        onClick={() => { setEditingUser(null); setShowModal(true); }}
      />

      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search users..."
      />

      {showForm && <AddUserForm onClose={() => setShowForm(false)} onAddUser={handleAddUser} />}

      {paginatedUsers.length > 0 ? (
        <>
          <StyledTable
            headers={headers}
            columns={columns}
            data={paginatedUsers}
            renderCell={(user, col) => {
              if (col === "name") {
                return (
                  <button
                    onClick={() => { setEditingUser(user); setShowModal(true); }}
                    className="text-blue-400 hover:underline"
                  >
                    {user.name}
                  </button>
                );
              }
              if (col === "mobile_number") return user.mobile_number;
              if (col === "id") {
                return user.identifications?.length > 0
                  ? user.identifications.map((id) => id.id_number).join(", ")
                  : "N/A";
              }
              return "-";
            }}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No users found.
        </div>
      )}

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? "Edit User" : "Add User"}
        >
          <AddUserForm
            initialData={editingUser}
            onClose={() => setShowModal(false)}
            onAddUser={editingUser ? handleSaveEdit : handleAddUser}
          />
        </Modal>
      )}

      {selectedUser && !editingUser && (
        <UserDetailsPopup
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
