"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../users/styles.css"; // Import the CSS

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
    identifications: [{ id_type: "Aadhaar", id_number: "" }], // ✅ Initial one ID field
  });

  const [errorMessage, setErrorMessage] = useState({
    user_id: "",
    mobile_number: "",
  });
  const userIDs = newUser.user_id ? [{ id_type: "Aadhaar", id_number: newUser.user_id }] : [];

  const handleIDChange = (index, field, value) => {
    const updatedIDs = [...newUser.identifications];
    updatedIDs[index][field] = value;
    setNewUser({ ...newUser, identifications: updatedIDs });
  };

  const handleAddID = () => {
    setNewUser({
      ...newUser,
      identifications: [...newUser.identifications, { id_type: "", id_number: "" }],
    });
  };

  const handleRemoveID = (index) => {
    const updatedIDs = [...newUser.identifications];
    updatedIDs.splice(index, 1); // Remove the selected ID
    setNewUser({ ...newUser, identifications: updatedIDs });
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
        setUsers(updatedUsers);
      })
      .catch((err) => console.error(err));
  }, []);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.mobile_number.includes(query) ||
      (user.user_id && user.user_id.includes(query))
    );
  });

  const handleShowUserDetails = (user) => {
    setSelectedUser({
      ...user,
      name: user.name || "", 
      mobile_number: user.mobile_number || "", 
      identifications: user.identifications?.length ? user.identifications : [{ id_type: "", id_number: "" }]
    });
    setIsEditing(false);
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

    // Capitalize names
    const capitalizedValue = name === "name" ? capitalizeWords(value) : value;

    // Ensure only numbers (10-digit mobile, 12-digit ID)
    if (name === "mobile_number" && value && !/^\d{0,10}$/.test(value)) {
      return; // Restrict input beyond 10 digits
    }
    if (name === "user_id" && value && !/^\d{0,12}$/.test(value)) {
      return; // Restrict input beyond 12 digits
    }

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
    try {
      // Remove empty mobile numbers or empty IDs before sending the request
      const cleanedUser = {
        name: newUser.name.trim(),
      };

      if (newUser.mobile_number.trim() !== "") {
        cleanedUser.mobile_number = newUser.mobile_number.trim();
      }

      const validIdentifications = newUser.identifications.filter(
        (id) => id.id_type.trim() !== "" && id.id_number.trim() !== ""
      );

      if (validIdentifications.length > 0) {
        cleanedUser.identifications = validIdentifications;
      }

      const response = await fetch("http://localhost:8001/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedUser),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error:", data);
        alert("Error: " + JSON.stringify(data));
        return;
      }

      setUsers([...users, data]); // Update state
      setNewUser({ name: "", mobile_number: "", identifications: [{ id_type: "Aadhaar", id_number: "" }] });
      setShowForm(false);
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
                  value={newUser.name || ""}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="mobile_number"
                  placeholder="Enter Mobile Number"
                  value={newUser.mobile_number || ""}
                  onChange={handleInputChange}
                />

                {errorMessage.mobile_number && <p className="error-text">{errorMessage.mobile_number}</p>}
                {newUser.identifications.map((id, index) => (
                  <div key={index} className="id-input-group">
                    <select
                      value={id.id_type}
                      onChange={(e) => handleIDChange(index, "id_type", e.target.value)}
                    >
                      <option value="">Select ID Type</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Passport">Passport</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Enter ID Number"
                      value={id.id_number || ""}
                      onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
                    />


                    {/* Show Remove Button only if more than 1 ID exists */}
                    {newUser.identifications.length > 1 && (
                      <button type="button" className="remove-button" onClick={() => handleRemoveID(index)}>
                        ❌
                      </button>
                    )}
                  </div>
                ))}

                {/* Show "Add More ID" Button always after at least one ID is added */}
                <button type="button" onClick={handleAddID} disabled={!newUser.identifications[0].id_type || !newUser.identifications[0].id_number}>
                  + Add More ID
                </button>



                {errorMessage.user_id && <p className="error-text">{errorMessage.user_id}</p>}
                <button className="add-button mt-15" onClick={handleAddUser}>Save</button>
              </div>
            </div>
          )}

          {/* User Table */}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>ID</th>
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
                  <td>
                    {user.identifications.length > 0
                      ? user.identifications.map(id => `${id.id_type}: ${id.id_number}`).join(", ")
                      : "N/A"}
                  </td>


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
            <span className="close-button" onClick={handleCloseDetails}>&times;</span>
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
                <h3>Identifications</h3>
                {selectedUser.identifications.map((id, index) => (
  <div key={index}>
    <label>{id.id_type}</label>
    <input
      type="text"
      value={id.id_number || ""}
      onChange={(e) => {
        const newIdentifications = [...selectedUser.identifications];
        newIdentifications[index].id_number = e.target.value || "";
        setSelectedUser({ ...selectedUser, identifications: newIdentifications });
      }}
    />
  </div>
))}

                <button className="save-button" onClick={handleSaveEdit}>
                  Save
                </button>
              </>
            ) : (
              <>
                <h2>{selectedUser.name}</h2>
                <p><strong>ID:</strong> {selectedUser.identifications.length > 0
                  ? selectedUser.identifications.map(id => `${id.id_type}: ${id.id_number}`).join(", ")
                  : "N/A"}
                </p>
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
