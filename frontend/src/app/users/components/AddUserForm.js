"use client";
import { useState } from "react";

export default function AddUserForm({ onClose, onAddUser }) {
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
    identifications: [{ id_type: "Aadhaar", id_number: "" }], // ✅ Default ID field
  });

  const [errorMessage, setErrorMessage] = useState({
    user_id: "",
    mobile_number: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure only numbers (10-digit mobile, 12-digit ID)
    if (name === "mobile_number" && value && !/^\d{0,10}$/.test(value)) {
      return;
    }
    if (name === "user_id" && value && !/^\d{0,12}$/.test(value)) {
      return;
    }

    setNewUser({ ...newUser, [name]: value });
  };

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
    updatedIDs.splice(index, 1);
    setNewUser({ ...newUser, identifications: updatedIDs });
  };

  const handleSubmit = async () => {
    try {
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

      onAddUser(cleanedUser); // Call parent function to add user
      onClose(); // Close the form
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
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
            <select value={id.id_type} onChange={(e) => handleIDChange(index, "id_type", e.target.value)}>
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

            {newUser.identifications.length > 1 && (
              <button type="button" className="remove-button" onClick={() => handleRemoveID(index)}>
                ❌
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={handleAddID} disabled={!newUser.identifications[0].id_type || !newUser.identifications[0].id_number}>
          + Add More ID
        </button>
        {errorMessage.user_id && <p className="error-text">{errorMessage.user_id}</p>}

        <button className="add-button mt-15" onClick={handleSubmit}>
          Save
        </button>
      </div>
    </div>
  );
}
