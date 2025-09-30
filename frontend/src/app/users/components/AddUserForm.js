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
    identifications: [{ id_name: "", id_number: "" }], // ID Name + ID Number
  });

  useEffect(() => {
    if (initialData) {
      setNewUser({
        ...initialData,
        identifications: initialData.identifications?.map((id) => ({
          id_name: id.id_name || "",
          id_number: id.id_number || "",
        })) || [{ id_name: "", id_number: "" }],
      });
    }
  }, [initialData]);

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    mobile_number: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    if (errorMessage[name]) setErrorMessage({ ...errorMessage, [name]: "" });
  };

  const handleIDChange = (index, field, value) => {
    const updatedIDs = [...newUser.identifications];
    updatedIDs[index][field] = value;
    setNewUser({ ...newUser, identifications: updatedIDs });
  };

  const handleAddID = () => {
    setNewUser({
      ...newUser,
      identifications: [...newUser.identifications, { id_name: "", id_number: "" }],
    });
  };

  const handleRemoveID = (index) => {
    const updatedIDs = [...newUser.identifications];
    updatedIDs.splice(index, 1);
    setNewUser({ ...newUser, identifications: updatedIDs });
  };

  const handleSubmit = async () => {
    let errors = {};

    if (!newUser.name.trim()) {
      errors.name = "Full Name is required!";
    } else if (!/^[A-Za-z\s]+$/.test(newUser.name)) {
      errors.name = "Name can only contain letters and spaces!";
    }

    if (newUser.mobile_number && !/^\d{10}$/.test(newUser.mobile_number)) {
      errors.mobile_number = "Mobile number must be 10 digits!";
    }

    newUser.identifications.forEach((id, index) => {
      if (!id.id_number.trim() || !id.id_name.trim()) {
        errors[`id_${index}`] = "Both ID Name and Number are required!";
      }
    });

    if (Object.keys(errors).length > 0) {
      setErrorMessage(errors);
      return;
    }

    const cleanedUser = {
      ...newUser,
      identifications: newUser.identifications.filter(
        id => id.id_name.trim() !== "" && id.id_number.trim() !== ""
      ).map(id => ({
        id_name: id.id_name,
        id_number: id.id_number
      })),
    };

    await onAddUser(cleanedUser);
    onClose();
  };

  return (
    <div className={styles.modalFormGroup}>
      <input
        type="text"
        name="name"
        className={styles.modalFormInput}
        placeholder="Full Name"
        value={newUser.name}
        onChange={handleInputChange}
      />
      {errorMessage.name && <p className="error-text">{errorMessage.name}</p>}

      <input
        type="text"
        name="mobile_number"
        className={styles.modalFormInput}
        placeholder="Mobile Number"
        value={newUser.mobile_number}
        onChange={handleInputChange}
      />
      {errorMessage.mobile_number && <p className="error-text">{errorMessage.mobile_number}</p>}

      <select
        name="gender"
        value={newUser.gender}
        onChange={handleInputChange}
        className={styles.modalFormInput}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      {newUser.identifications.map((id, index) => (
        <div key={index} className="id-input-group">
          <input
            type="text"
            className={styles.modalFormInput}
            placeholder="ID Name"
            value={id.id_name || ""}
            onChange={(e) => handleIDChange(index, "id_name", e.target.value)}
          />
          <input
            type="text"
            className={styles.modalFormInput}
            placeholder="ID Number"
            value={id.id_number || ""}
            onChange={(e) => handleIDChange(index, "id_number", e.target.value)}
          />
          {errorMessage[`id_${index}`] && (
            <p className="error-text">{errorMessage[`id_${index}`]}</p>
          )}
          {newUser.identifications.length > 1 && (
            <button
              onClick={() => handleRemoveID(index)}
              className={styles.removeButton}
            >
              <DeleteIcon className={styles.icon} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddID}
        className="service-edit-btn"
        style={{ marginRight: "0.7rem" }}
      >
        + Add More ID
      </button>

      <button className={styles.buttonSubmit} onClick={handleSubmit}>
        Save
      </button>
    </div>
  );
}
