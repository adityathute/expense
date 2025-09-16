"use client";

import React, { useState, useEffect } from "react";

export default function UserDetailsPopup({ selectedUser, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(selectedUser);

  // Sync when user changes
  useEffect(() => {
    if (selectedUser) {
      setEditedUser({
        ...selectedUser,
        identifications: selectedUser.identifications || [],
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
        [field]: value, // ✅ keep id, id_type, other_doc_name
      };
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
              <div key={id.id || index}>
                <label>{id.id_type}</label>
                <input
                  type="text"
                  value={id.id_number || ""}
                  onChange={(e) =>
                    handleIDChange(index, "id_number", e.target.value)
                  }
                />
                {id.other_doc_name !== null && (
                  <input
                    type="text"
                    placeholder="Other doc name"
                    value={id.other_doc_name || ""}
                    onChange={(e) =>
                      handleIDChange(index, "other_doc_name", e.target.value)
                    }
                  />
                )}
              </div>
            ))}

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
                    .map(
                      (id) =>
                        `${id.id_type}: ${id.id_number}${
                          id.other_doc_name ? ` (${id.other_doc_name})` : ""
                        }`
                    )
                    .join(", ")
                : "N/A"}
            </p>
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
