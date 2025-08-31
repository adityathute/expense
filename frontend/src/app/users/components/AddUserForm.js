// users/components/AddUserForm.js
"use client";
import { useState, useEffect } from "react";
import styles from "../../styles/components/modalForm.module.css";
import { DeleteIcon } from "../../components/Icons";

export default function AddUserForm({ onClose, onAddUser, initialData = null }) {
  const [newUser, setNewUser] = useState({
    name: "",
    mobile_number: "",
    gender: "",
    user_type: ["Customer"],
    identifications: [{ id_type: "Aadhaar", id_number: "" }],
  });

  useEffect(() => {
    if (initialData) {
      setNewUser({
        ...initialData,
        identifications: initialData.identifications.length
          ? initialData.identifications
          : [{ id_type: "Aadhaar", id_number: "" }],
      });
    }
  }, [initialData]);

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
    <div className={styles.modalFormGroup}>
      <input
        type="text"
        name="name"
        className={styles.modalFormInput}
        placeholder="Full Name"
        value={newUser.name || ""}
        onChange={handleInputChange}
        required
      />
      {errorMessage.name && <p className="error-text">{errorMessage.name}</p>}

      {/* Mobile Number */}
      <div className="id-input-group">

        <input
          type="text"
          name="mobile_number"
          placeholder="Mobile Number"
          value={newUser.mobile_number || ""}
          onChange={handleInputChange}
          className={styles.modalFormInput}
        />

        <div className="">
          <select className={styles.modalFormInput}
            name="gender" value={newUser.gender} onChange={handleInputChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
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
                  className={styles.modalFormInput}                >
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
              </div>
              {/* Custom document name input appears in a new row when "Other" is selected */}
              {id.id_type === "Other" && (
                <div className="other-document-container">
                  <input
                    type="text"
                    placeholder="Document Name"
                    className={styles.modalFormInput}
                    value={id.other_doc_name || ""}
                    onChange={(e) => handleIDChange(index, "other_doc_name", e.target.value)}
                  />
                </div>
              )}
              <div className={styles.idInputRow}>
                <input
                  type="text"
                  className={styles.modalFormInput}
                  placeholder="ID Number"
                  value={id.id_number || ""}
                  onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
                />
                {newUser.identifications.length > 1 && (
                  <button
                    onClick={() => handleRemoveID(index)}
                    className={styles.removeButton}
                    aria-label="Remove Document"
                    style={{ marginBottom: "0.8rem" }} // inline style
                  >
                    <DeleteIcon className={styles.icon} />
                  </button>
                )}
              </div>

            </div>
            <div className="">
              {/* Aadhaar Number Validation Error Below Input */}
              {errorMessage[`id_${index}`] && <p className="error-text">{errorMessage[`id_${index}`]}</p>}
            </div>
          </div>
        </div>
      ))}

      <button
        className="service-edit-btn"
        type="button"
        onClick={handleAddID}
        disabled={!newUser.identifications[0].id_type || !newUser.identifications[0].id_number}
      >
        + Add More ID
      </button>

      {errorMessage.user_id && <p className="error-text">{errorMessage.user_id}</p>}

      <button
        className={styles.buttonSubmit}
        onClick={handleSubmit}
        style={{ marginLeft: "0.7rem" }} // inline margin-left
      >
        Save
      </button>

    </div>
  );
}
