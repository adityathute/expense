"use client";

import React, { useEffect } from "react";
import styles from "../styles/components/modalForm.module.css";

export default function ServiceForm({
  newService,
  description,
  setDescription,
  handleInputChange,
  handleSubmit,
  handleLinkChange,
  addLink,
  removeLink,
  editingService,
  resetForm,
  formErrors = {},
  showLinksSection,
  setShowLinksSection,
}) {
  useEffect(() => {
    if (editingService && newService.links.length > 0) {
      setShowLinksSection(true);
    }
  }, [editingService, newService.links.length, setShowLinksSection]);

  return (
    <form className={styles.modalformWrapper} onSubmit={handleSubmit}>
      {/* === Name === */}
      <div className={styles.modalFormGroup}>
        <input
          type="text"
          name="name"
          value={newService.name}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
          className={styles.modalFormInput}
          spellCheck={false}
        />
        {formErrors.name && (
          <div className={styles.modalformError}>{formErrors.name}</div>
        )}
      </div>

      {/* === Description === */}
      <div>
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.modalFormTextarea}
          placeholder="Description"
          spellCheck={false}
        />
      </div>

      {/* === Numeric Inputs === */}
      {[
        { name: "service_fee", placeholder: "Service Fee" },
        { name: "service_charge", placeholder: "Service Charge" },
        { name: "other_charge", placeholder: "Other Charge" },
        { name: "pages_required", placeholder: "Pages Required" },
        {
          name: "required_time_hours",
          step: "0.1",
          placeholder: "Required Time (hours)",
        },
      ].map(({ name, step = "1", placeholder }) => (
        <div key={name}>
          <input
            type="number"
            name={name}
            value={newService[name] === 0 ? "" : newService[name]}
            step={step}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={styles.modalFormInput}
            spellCheck={false}
          />
        </div>
      ))}

      {/* === Links Section === */}
      {showLinksSection && newService.links.length > 0 && (
        <div>
          {newService.links.map((link, index) => (
            <div key={index} className={styles.modalformWrapper}>
              <input
                type="text"
                placeholder="Label"
                value={link.label}
                onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                className={styles.modalFormInput}
                spellCheck={false}
              />
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className={styles.modalFormInput}
                spellCheck={false}
              />
              <button
                type="button"
                className={styles.buttonRemoveLink}
                onClick={() => removeLink(index)}
              >
                Remove Link
              </button>
            </div>
          ))}
        </div>
      )}

      {/* === Link Add Button === */}
      <button
        type="button"
        className={styles.buttonAddLink}
        onClick={addLink}
      >
        Add Link
      </button>

      {/* === Action Buttons === */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
        <button type="submit" className={styles.buttonSubmit}>
          {editingService ? "Update Service" : "Create Service"}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className={styles.buttonCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
