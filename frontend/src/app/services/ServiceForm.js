"use client";

import React, { useEffect, useRef } from "react";
import styles from "../styles/components/modalForm.module.css";
import { DeleteIcon } from "../components/Icons";

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
  formErrors = {},
  showLinksSection,
  setShowLinksSection,
}) {
  const nameInputRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768; // or use a more specific check
    if (!isMobile) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 400); // delay to match modal animation
      return () => clearTimeout(timer);
    }
  }, []);

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
          ref={nameInputRef}

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
            <div key={index} className={styles.linkRow}>
              <input
                type="text"
                placeholder="Label"
                value={link.label}
                onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                className={`${styles.modalFormInput} ${styles.linkLabelInput}`}
                spellCheck={false}
              />
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className={`${styles.modalFormInput} ${styles.linkUrlInput}`}
                spellCheck={false}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeLink(index)}
                aria-label="Remove Link"
              >
                <DeleteIcon className={styles.icon} />
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
      <div
        style={{
          display: "flex",
          justifyContent: "center", // <-- centers horizontally
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <button type="submit" className={styles.buttonSubmit}>
          {editingService ? "Update Service" : "Create Service"}
        </button>
      </div>

    </form>
  );
}
