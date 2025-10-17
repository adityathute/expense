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
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/users/");
      const data = await res.json();
      const updatedUsers = data
        .filter((u) => !u.is_deleted) // <-- ignore deleted users
        .map((user) => ({
          ...user,
          identifications: user.identifications || [],
        }));
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  // Soft delete handler
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/users/${userId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Soft delete failed");
      }

      // Remove deleted user from displayed list
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_deleted: true } : u))
      );

      // Filter out deleted users for display
      setFilteredUsers((prev) =>
        prev.filter((u) => u.id !== userId)
      );

      // Close the popup
      setSelectedUser(null);
    } catch (err) {
      console.error("Error soft deleting user:", err);
    }
  };

  const handleSaveEdit = async (userData) => {
    if (!userData?.id) return; // ✅ ensure ID present

    try {
      const payload = {
        name: userData.name,
        mobile_number: userData.mobile_number,
        gender: userData.gender,
        user_type: userData.user_type || "",
        identifications: userData.identifications.map((id) => ({
          id_name: id.id_name,
          id_number: id.id_number,
          is_deleted: id.is_deleted || false,
          id: id.id || undefined,
        })),
      };

      const response = await fetch(`http://127.0.0.1:8001/api/users/${userData.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        setFilteredUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );

        setSelectedUser(updatedUser); // ✅ keep popup open with new data
      } else {
        const err = await response.json();
        console.error("Failed to update user:", err);
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

    const filtered = users
      .filter((u) => !u.is_deleted) // ignore deleted users
      .filter((user) => {
        const lowerCaseQuery = query.toLowerCase();
        return (
          (user.name?.toLowerCase().includes(lowerCaseQuery) || false) ||
          (user.mobile_number?.includes(lowerCaseQuery) || false) ||
          (user.identifications?.some((id) =>
            id.id_number?.toLowerCase().includes(lowerCaseQuery)
          ) || false)
        );
      });

    setFilteredUsers(filtered);
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
        onClick={() => {
          setShowForm(true);
          setSelectedUser(null);
        }}
      />

      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search users..."
      />

      {showForm && (
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add User">
          <AddUserForm onClose={() => setShowForm(false)} onAddUser={handleAddUser} />
        </Modal>
      )}

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
                    onClick={() => {
                      setSelectedUser(user);
                      setEditingUser(user);  // ✅ Add this
                      setShowForm(false);
                    }}
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

      {selectedUser && (
        <UserDetailsPopup
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteUser} // soft delete
        />
      )}
    </div>
  );
}
