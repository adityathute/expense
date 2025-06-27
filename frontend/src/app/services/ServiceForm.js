"use client";

import React, { useEffect, useRef } from "react";
import styles from "../styles/components/modalForm.module.css";
import { DeleteIcon } from "../components/Icons";

export default function ServiceForm({
  newService,
  setNewService,
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
  handleDocumentChange,
  addRequiredDocument,
  removeRequiredDocument,
}) {
  const nameInputRef = useRef(null);

  const safeValue = (val) =>
    val === 0 || val === "" || val === false ? "" : val ?? "";

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <form className={styles.modalformWrapper} onSubmit={handleSubmit}>
      {/* === Name === */}
      <div className={styles.modalFormGroup}>
        <input
          type="text"
          name="name"
          value={safeValue(newService?.name)}
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
          value={safeValue(description)}
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
            value={safeValue(newService?.[name])}
            step={step}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={styles.modalFormInput}
            spellCheck={false}
          />
        </div>
      ))}

      {/* === Links Section === */}
      {showLinksSection && (newService?.links || []).length > 0 && (
        <div>
          {(newService?.links || []).map((link, index) => (
            <div key={index} className={styles.linkRow}>
              <input
                type="text"
                placeholder="Label"
                value={safeValue(link.label)}
                onChange={(e) =>
                  handleLinkChange(index, "label", e.target.value)
                }
                className={`${styles.modalFormInput} ${styles.linkLabelInput}`}
                spellCheck={false}
              />
              <input
                type="url"
                placeholder="URL"
                value={safeValue(link.url)}
                onChange={(e) =>
                  handleLinkChange(index, "url", e.target.value)
                }
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

      {/* === Add Link Button === */}
      <button
        type="button"
        className={styles.buttonAddLink}
        onClick={addLink}
      >
        Add Link
      </button>

      {/* === Required Documents Section === */}
      <h4 className={styles.sectionTitle}>Required Documents</h4>
      {(newService?.required_documents || []).map((doc, index) => (
        <div key={index} className={styles.documentRow}>
          <input
            type="text"
            placeholder="Document Name"
            value={safeValue(doc.name)}
            onChange={(e) =>
              handleDocumentChange(index, "name", e.target.value)
            }
            className={styles.modalFormInput}
          />
          <select
            value={safeValue(doc.document_type)}
            onChange={(e) =>
              handleDocumentChange(index, "document_type", e.target.value)
            }
            className={styles.modalFormInput}
          >
            <option value="Original">Original</option>
            <option value="Xerox">Xerox</option>
          </select>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={doc.is_mandatory ?? false}
              onChange={(e) =>
                handleDocumentChange(index, "is_mandatory", e.target.checked)
              }
            />
            Mandatory
          </label>
          <textarea
            placeholder="Additional Details (optional)"
            value={safeValue(doc.additional_details)}
            onChange={(e) =>
              handleDocumentChange(index, "additional_details", e.target.value)
            }
            className={styles.modalFormTextarea}
          />
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeRequiredDocument(index)}
          >
            <DeleteIcon className={styles.icon} />
          </button>
        </div>
      ))}

      {/* === Add Document Button === */}
      <button
        type="button"
        className={styles.buttonAddLink}
        onClick={addRequiredDocument}
      >
        Add Document
      </button>

      {/* === Submit Button === */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
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
