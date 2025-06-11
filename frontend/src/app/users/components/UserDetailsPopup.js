// users/components/UserDetailsPopup.js
"use client";

import React, { useState } from "react";

export default function UserDetailsPopup({ selectedUser, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(selectedUser);

  if (!selectedUser) return null; // If no user is selected, do not render the popup

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleIDChange = (index, value) => {
    const updatedIDs = [...editedUser.identifications];
    updatedIDs[index].id_number = value;
    setEditedUser({ ...editedUser, identifications: updatedIDs });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>

        {isEditing ? (
          <>
            <h2>Edit User</h2>
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="mobile_number"
              value={editedUser.mobile_number}
              onChange={handleInputChange}
            />

            <h3>Identifications</h3>
            {editedUser.identifications.map((id, index) => (
              <div key={index}>
                <label>{id.id_type}</label>
                <input
                  type="text"
                  value={id.id_number || ""}
                  onChange={(e) => handleIDChange(index, e.target.value)}
                />
              </div>
            ))}

            <button className="save-button" onClick={() => onSave(editedUser)}>
              Save
            </button>
          </>
        ) : (
          <>
            <h2>{selectedUser.name}</h2>
            <p>
              <strong>ID:</strong>{" "}
              {selectedUser.identifications.length > 0
                ? selectedUser.identifications.map(
                  (id) => `${id.id_type}: ${id.id_number}`
                ).join(", ")
                : "N/A"}
            </p>
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
