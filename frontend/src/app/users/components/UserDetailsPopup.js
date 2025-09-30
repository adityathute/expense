"use client";

import React, { useState, useEffect } from "react";

export default function UserDetailsPopup({ selectedUser, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    mobile_number: "",
    identifications: [{ id_name: "", id_number: "" }],
  });

  useEffect(() => {
    if (selectedUser) {
      setEditedUser({
        ...selectedUser,
        identifications:
          selectedUser.identifications?.map((id) => ({
            id_name: id.id_name || "",
            id_number: id.id_number || "",
          })) || [{ id_name: "", id_number: "" }],
      });
    }
  }, [selectedUser]);

  if (!selectedUser) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleIDChange = (index, field, value) => {
    setEditedUser((prev) => {
      const updatedIDs = [...prev.identifications];
      updatedIDs[index] = {
        ...updatedIDs[index],
        [field]: value,
      };
      return { ...prev, identifications: updatedIDs };
    });
  };

  const handleAddID = () => {
    setEditedUser((prev) => ({
      ...prev,
      identifications: [...prev.identifications, { id_name: "", id_number: "" }],
    }));
  };

  const handleRemoveID = (index) => {
    setEditedUser((prev) => {
      const updatedIDs = [...prev.identifications];
      updatedIDs.splice(index, 1);
      return { ...prev, identifications: updatedIDs };
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>

        {isEditing ? (
          <>
            <h2>Edit User</h2>
            <input
              type="text"
              name="name"
              value={editedUser.name || ""}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="mobile_number"
              value={editedUser.mobile_number || ""}
              onChange={handleInputChange}
            />

            <h3>Identifications</h3>
            {editedUser.identifications.map((id, index) => (
              <div key={index} className="id-input-group">
                <input
                  type="text"
                  placeholder="ID Name"
                  value={id.id_name || ""}
                  onChange={(e) => handleIDChange(index, "id_name", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="ID Number"
                  value={id.id_number || ""}
                  onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
                />
                {editedUser.identifications.length > 1 && (
                  <button onClick={() => handleRemoveID(index)}>Remove</button>
                )}
              </div>
            ))}
            <button onClick={handleAddID}>+ Add More ID</button>

            <button
              className="save-button"
              onClick={() => {
                onSave(editedUser);
                setIsEditing(false);
              }}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <h2>{selectedUser.name}</h2>
            <p>
              <strong>Mobile:</strong> {selectedUser.mobile_number}
            </p>
            <p>
              <strong>ID:</strong>{" "}
              {selectedUser.identifications?.length > 0
                ? selectedUser.identifications
                    .map((id) => `${id.id_name || "N/A"}: ${id.id_number || "N/A"}`)
                    .join(", ")
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
