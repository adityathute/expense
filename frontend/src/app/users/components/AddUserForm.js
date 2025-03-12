"use client";
import { useState } from "react";

export default function AddUserForm({ onClose, onAddUser }) {
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
    gender: "", // Add gender field
    identifications: [{ id_type: "Aadhaar", id_number: "" }], // Default field
  });

  const [errorMessage, setErrorMessage] = useState({
    user_id: "",
    mobile_number: "",
    
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "mobile_number" && value && !/^\d{0,10}$/.test(value)) {
      return;
    }
  
    let updatedValue = value;
  
    if (name === "name") {
      updatedValue = value
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  
    setNewUser({ ...newUser, [name]: updatedValue });
  
    // Clear the error message when the user starts typing again
    if (errorMessage[name]) {
      setErrorMessage({ ...errorMessage, [name]: "" });
    }
  };
  

  // Aadhaar Formatting (12 digits, no dashes)
  const formatAadhaar = (value) => {
    return value.replace(/\D/g, "").slice(0, 12); // Remove non-numeric and limit to 12 digits
  };

  // PAN Card Formatting (ABCDE1234F) - 10 uppercase alphanumeric
  const formatPAN = (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  };

  // RC Card Formatting (12 digits, no dashes)
  const formatRC = (value) => {
    return value.replace(/\D/g, "").slice(0, 12);
  };

  const handleIDChange = (index, field, value) => {
    const updatedIDs = [...newUser.identifications];

    if (field === "id_type") {
      if (value === "Other" && !updatedIDs.some((id) => id.id_type === "Other" && id !== updatedIDs[index])) {
        updatedIDs.push({ id_type: "", id_number: "" }); // Add new row when 'Other' is selected
      }
    }

    if (field === "id_number") {
      const idType = updatedIDs[index].id_type;
      if (idType === "Aadhaar") {
        value = formatAadhaar(value);
      } else if (idType === "Pancard") {
        value = formatPAN(value);
      } else if (idType === "Ration Card") {
        value = formatRC(value);
      }
    }

    updatedIDs[index][field] = value;
    setNewUser({ ...newUser, identifications: updatedIDs });

    setTimeout(() => {
      document.getElementsByName("id_number")[index]?.focus();
    }, 0);
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
      // Validate Mobile Number (Ensure it is exactly 10 digits)
      if (!/^\d{10}$/.test(newUser.mobile_number)) {
        setErrorMessage({ ...errorMessage, mobile_number: "Oops! 10 digits only!" });
        return; // Prevent submission
      }

      const cleanedUser = {
        name: newUser.name.trim(),
        mobile_number: newUser.mobile_number.trim(),
        identifications: newUser.identifications
          .map((id) => ({
            id_type: id.id_type.trim(),
            id_number: id.id_number.trim(),
          }))
          .filter((id) => id.id_number !== ""),
      };

      // Reset previous errors
      setErrorMessage({ user_id: "", mobile_number: "" });

      const response = await onAddUser(cleanedUser);

      if (response && response.errors) {
        setErrorMessage(response.errors); // Show errors inline instead of alert
        return;
      }

      // Reset form after success
      setNewUser({ name: "", mobile_number: "", identifications: [{ id_type: "Aadhaar", id_number: "" }] });
      onClose();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        console.error("Error adding user:", error); // Log error for debugging
      }
    }
  };



  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-content-inner">
          <span className="close-button" onClick={onClose}>
            &times;
          </span>
          <h2>Add User</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={newUser.name || ""}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="mobile_number"
            placeholder="Mobile Number"
            value={newUser.mobile_number || ""}
            onChange={handleInputChange}
            className={errorMessage.mobile_number ? "error-input" : ""}
          />
          {errorMessage.mobile_number && <p className="error-text">{errorMessage.mobile_number}</p>}

          {newUser.identifications.map((id, index) => (
            <div key={index} className="id-input-group">
              {/* ID Type dropdown and ID Number input remain in a row */}
              <div className="id-main-group">
                <div className="dropdown-container">
                  <select
                    value={id.id_type}
                    onChange={(e) => handleIDChange(index, "id_type", e.target.value)}
                    className="custom-dropdown"
                  >
                    <option value="">Select ID Type</option>
                    {["Aadhaar", "Pancard", "Voter ID", "Driving License", "Passport", "Ration Card", "Other"]
                      .filter((idType) =>
                        idType === id.id_type || !newUser.identifications.some((i) => i.id_type === idType)
                      )
                      .map((filteredId) => (
                        <option key={filteredId} value={filteredId}>
                          {filteredId}
                        </option>
                      ))}
                  </select>

                  {/* Custom Arrow Icon */}
                  <svg className="dropdown-icon" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                  </svg>
                </div>

                <input
                  type="text"
                  className="id-number-input"
                  placeholder="ID Number"
                  value={id.id_number || ""}
                  onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
                />
                {newUser.identifications.length > 1 && (
                  <button type="button" className="remove-button" onClick={() => handleRemoveID(index)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="black"
                    >
                      <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm2 2v9h10v-9H7zm4-6h2v2h-2V5zm-1 2h4v2h-4V7z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Custom document name input appears in a new row when "Other" is selected */}
              {id.id_type === "Other" && (
                <div className="other-document-container">
                  <input
                    type="text"
                    placeholder="Document Name"
                    value={id.custom_name || ""}
                    onChange={(e) => handleIDChange(index, "custom_name", e.target.value)}
                  />
                </div>
              )}

            </div>
          ))}

          <button
            className="add-more-id-button"
            type="button"
            onClick={handleAddID}
            disabled={!newUser.identifications[0].id_type || !newUser.identifications[0].id_number}
          >
            + Add More ID
          </button>
          {errorMessage.user_id && <p className="error-text">{errorMessage.user_id}</p>}

          <button className="add-id-button mt-15" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
