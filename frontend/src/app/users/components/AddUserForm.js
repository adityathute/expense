"use client";
import { useState } from "react";

export default function AddUserForm({ onClose, onAddUser }) {
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
    gender: "",
    user_type: ["Customer"], // Default user type set to "Customer"
    identifications: [{ id_type: "Aadhaar", id_number: "" }], // Default field
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    user_id: "",
    mobile_number: "",

  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile_number" && value && !/^\d{0,10}$/.test(value)) {
      return; // Allow only up to 10 digits
    }

    let updatedValue = value;

    if (name === "name") {
      // Allow only letters and spaces (no numbers or special characters)
      updatedValue = value.replace(/[^A-Za-z\s]/g, "");

      // Prevent multiple spaces
      updatedValue = updatedValue.replace(/\s+/g, " ");

      // Capitalize first letter of each word
      updatedValue = updatedValue
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    setNewUser({ ...newUser, [name]: updatedValue });

    // Clear error message when user types again
    if (errorMessage[name]) {
      setErrorMessage({ ...errorMessage, [name]: "" });
    }
  };

  const handleIDChange = (index, field, value) => {
    const updatedIDs = [...newUser.identifications];

    if (field === "id_type") {
      updatedIDs[index][field] = value;
      if (value !== "Other") {
        updatedIDs[index]["other_doc_name"] = ""; // Reset custom name if not "Other"
      }
    } else if (field === "id_number") {
      const idType = updatedIDs[index].id_type;
      let formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Remove non-alphanumeric characters

      if (idType === "Aadhaar" || idType === "Ration Card" || idType === "Aapaar ID") {
        formattedValue = formattedValue.replace(/\D/g, "").slice(0, 12);
        if (!/^\d{12}$/.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: `${idType} must be exactly 12 digits!`,
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "ABHA ID") {
        formattedValue = formattedValue.replace(/\D/g, "").slice(0, 14);
        if (!/^\d{14}$/.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "ABHA ID must be exactly 14 digits!",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "Pancard") {
        formattedValue = formattedValue.slice(0, 10);
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "Invalid PAN format! (ABCDE1234F)",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "Voter ID") {
        formattedValue = formattedValue.slice(0, 10);
        if (!/^[A-Z]{3}[0-9]{7}$/.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "Invalid Voter ID format! (ABC1234567)",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "Passport") {
        formattedValue = formattedValue.slice(0, 8);
        if (!/^[A-Z][0-9]{7}$/.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "Invalid Passport format! (S1234567)",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "Driving License") {
        formattedValue = formattedValue.slice(0, 15);
        const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{6,7}$/;
        if (!dlRegex.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "Invalid DL format! (e.g., MH2820251234567)",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      } else if (idType === "BOCW") {
        formattedValue = formattedValue.slice(0, 14);
        const bocwRegex = /^[A-Z]{2}[0-9]{12}$/; // Starts with state code, followed by 12 digits
        if (!bocwRegex.test(formattedValue)) {
          setErrorMessage((prevErrors) => ({
            ...prevErrors,
            [`id_${index}`]: "Invalid BOCW format! (e.g., MH123456789012)",
          }));
        } else {
          setErrorMessage((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[`id_${index}`];
            return newErrors;
          });
        }
      }

      updatedIDs[index][field] = formattedValue;
    } else if (field === "other_doc_name") {
      updatedIDs[index][field] = value; // Ensure custom document name is set
    }

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
      let errors = {};

      // Full Name Validation
      const nameParts = newUser.name.trim().split(/\s+/);
      const invalidCharsPattern = /[^A-Za-z\s]/;
      // const namePattern = /^(Om|[A-Za-z]{2,})\s+([A-Za-z]{1,2})?\s*([A-Za-z]{2,})$/;
      const namePattern = /^[A-Za-z]{2,}(\s+[A-Za-z]{1,})+$/;

      if (!newUser.name.trim()) {
        errors.name = "Full Name is required!";
      } else if (invalidCharsPattern.test(newUser.name)) {
        errors.name = "No special characters or numbers!";
      } else if (nameParts.length < 2) {
        errors.name = "Enter first & last name!";
      } else if (!namePattern.test(newUser.name.trim())) {
        errors.name = "Avoid single letters!";
      }

      // Mobile Number Validation
      if (newUser.mobile_number && !/^\d{10}$/.test(newUser.mobile_number)) {
        errors.mobile_number = "Oops! 10 digits only!";
      }

      // Aadhaar Number Validation
      newUser.identifications.forEach((id, index) => {
        if (id.id_type === "Aadhaar" && !/^\d{12}$/.test(id.id_number)) {
          errors[`id_${index}`] = "Aadhaar must be exactly 12 digits!";
        }
      });

      // If errors exist, update state and stop submission
      if (Object.keys(errors).length > 0) {
        setErrorMessage(errors);
        return;
      }

      // Reset previous errors
      setErrorMessage({});

      // Clean user data
      const cleanedUser = {
        name: newUser.name.trim(),
        mobile_number: newUser.mobile_number.trim(),
        gender: newUser.gender.trim(),
        user_type: newUser.user_type,
        identifications: newUser.identifications
          .map((id) => ({
            id_type: id.id_type.trim(),
            id_number: id.id_number.trim(),
            ...(id.id_type === "Other" && id.other_doc_name ? { other_doc_name: id.other_doc_name.trim() } : {}),
          }))
          .filter((id) => id.id_number !== ""),
      };

      const response = await onAddUser(cleanedUser);

      if (response && response.errors) {
        setErrorMessage(response.errors);
        return;
      }

      // Reset form after success
      setNewUser({
        name: "",
        mobile_number: "",
        gender: "",
        user_type: ["Customer"],
        identifications: [{ id_type: "Aadhaar", id_number: "" }],
      });

      onClose();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data);
      } else {
        console.error("Error adding user:", error);
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
            className="modal-content-input"
            placeholder="Full Name"
            value={newUser.name || ""}
            onChange={handleInputChange}
            required
          />
          {errorMessage.name && <p className="error-text">{errorMessage.name}</p>}

          {/* Mobile Number */}
          <div className="id-input-group">

            <div className="id-main-group">
              <input
                type="text"
                name="mobile_number"
                placeholder="Mobile Number"
                value={newUser.mobile_number || ""}
                onChange={handleInputChange}
                className="model-content-input-number"
              />

              <div className="dropdown-container">
                <select className="custom-dropdown" name="gender" value={newUser.gender} onChange={handleInputChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {/* Custom Arrow Icon */}
                <svg className="dropdown-icon" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                </svg>
              </div>

            </div>

          </div>
          {errorMessage.mobile_number && <p className="error-text">{errorMessage.mobile_number}</p>}

          {newUser.identifications.map((id, index) => (
            <div key={index} className="id-input-group">
              {/* ID Type dropdown and ID Number input remain in a row */}
              <div className="id-main-group-outer">
                <div className="id-main-group">
                  <div className="dropdown-container">
                    <select
                      value={id.id_type}
                      onChange={(e) => handleIDChange(index, "id_type", e.target.value)}
                      className="custom-dropdown"
                    >
                      <option value="">Select ID Type</option>
                      {["Aadhaar", "Pancard", "Voter ID", "Driving License", "Passport", "Ration Card", "BOCW", "Aapaar ID", "ABHA ID", "Other"]
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
                <div className="">
                  {/* Aadhaar Number Validation Error Below Input */}
                  {errorMessage[`id_${index}`] && <p className="error-text">{errorMessage[`id_${index}`]}</p>}
                </div>
              </div>
              {/* Custom document name input appears in a new row when "Other" is selected */}
              {id.id_type === "Other" && (
                <div className="other-document-container">
                  <input
                    type="text"
                    placeholder="Document Name"
                    className="modal-content-input"
                    value={id.other_doc_name || ""}
                    onChange={(e) => handleIDChange(index, "other_doc_name", e.target.value)}
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
