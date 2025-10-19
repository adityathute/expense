"use client";

import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { DeleteIcon } from "../../components/Icons";
import DeleteUserModal from "./DeleteUserModal"; // your reusable modal
import styles from "../../styles/components/modalForm.module.css";

export default function UserDetailsPopup({ selectedUser, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    mobile_number: "",
    gender: "",
    identifications: [{ id_name: "", id_number: "" }],
  });

  useEffect(() => {
    if (selectedUser) {
      setEditedUser({
        ...selectedUser,
        identifications: selectedUser.identifications?.map((id) => ({
          id_name: id.id_name || "",
          id_number: id.id_number || "",
        })) || [{ id_name: "", id_number: "" }],
      });
      setIsEditing(false);
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
      updatedIDs[index] = { ...updatedIDs[index], [field]: value };
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

  const handleSave = () => {
    onSave({ ...selectedUser, ...editedUser }); // ✅ ensures the ID and base user info are passed
    setIsEditing(false);
  };

  return (
    <>
      {/* Main User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={onClose}
        title={isEditing ? "Edit User" : selectedUser.name}
      >
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="flex flex-col gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={styles.modalFormInput}
                />
                <input
                  type="text"
                  name="mobile_number"
                  value={editedUser.mobile_number}
                  onChange={handleInputChange}
                  placeholder="Mobile Number"
                  className={styles.modalFormInput}
                />
                <select
                  name="gender"
                  value={editedUser.gender}
                  onChange={handleInputChange}
                  className={styles.modalFormInput}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Mobile:</strong> {selectedUser.mobile_number || "N/A"}</p>
                <p><strong>Gender:</strong> {selectedUser.gender || "N/A"}</p>
              </>
            )}
          </div>

          {/* Identifications */}
          {isEditing || editedUser.identifications.some(id => id.id_name || id.id_number) ? (
            <div>
              <h4 style={{ marginBottom: "0.5rem", marginLeft: "0.2rem" }}>Identifications:</h4>

              {editedUser.identifications.map((id, index) => (
                <div key={index} className={styles.linkRow}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        placeholder="ID Name"
                        value={id.id_name}
                        onChange={(e) => handleIDChange(index, "id_name", e.target.value)}
                        className={styles.linkUrlInput}
                      />
                      <input
                        type="text"
                        placeholder="ID Number"
                        value={id.id_number}
                        onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
                        className={styles.linkUrlInput}
                      />
                      {editedUser.identifications.length > 1 && (
                        <button onClick={() => handleRemoveID(index)} className={styles.removeButton}>
                          <DeleteIcon className={styles.icon} />
                        </button>
                      )}
                    </>
                  ) : (
                    (id.id_name || id.id_number) && (
                      <p>{id.id_name || "N/A"}: {id.id_number || "N/A"}</p>
                    )
                  )}
                </div>
              ))}

              {isEditing && (
                <button type="button" onClick={handleAddID} className="service-edit-btn">
                  + Add More ID
                </button>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {isEditing ? (
              // When editing → only show Save
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={handleSave} className={styles.buttonSubmit}>
                  Update User
                </button>
              </div>
            ) : (
              <>
                {/* Edit button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="service-edit-btn"
                  style={{ marginRight: "0.7rem" }}
                >
                  ✎ Edit User
                </button>

                {/* Delete button */}
                <button
                  className="service-delete-btn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑 Delete
                </button>
              </>
            )}
          </div>

        </div>
      </Modal>

      {/* Soft Delete Modal */}
      {showDeleteModal && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={(id) => {
            onDelete(id); // soft delete handler from parent
            setShowDeleteModal(false);
            onClose();
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          type="soft"
        />
      )}
    </>
  );
}
