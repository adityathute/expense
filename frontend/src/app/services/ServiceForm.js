"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/components/modalForm.module.css";
import { DeleteIcon } from "../components/Icons";
import SupportingDocumentsSection from "./SupportingDocumentsSection";

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
}) {
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const serviceId = editingService?.id || newService?.id;

  const [documents, setDocuments] = useState([]);
  const [newDocSelectValue, setNewDocSelectValue] = useState("");
  const [showNewDocForm, setShowNewDocForm] = useState(false);
  const [newDocData, setNewDocData] = useState({
    name: "",
    categories: "",
    additional_details: "",
  });
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [supportingDocs, setSupportingDocs] = useState([]);

  const safeValue = (val) =>
    val === 0 || val === "" || val === false ? "" : val ?? "";

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/documents/");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
      return data;
    } catch (err) {
      console.error("Error fetching documents:", err);
      return [];
    }
  };

  const handleSupportingDocsUpload = async (files) => {
    const uploaded = [];

    for (const file of files) {
      const name = prompt(`Enter name for: ${file.name}`);
      if (!name) continue;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("service", editingService?.id || newService?.id);

      try {
        const res = await fetch("http://127.0.1:8001/api/supporting-documents/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        uploaded.push(data);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    // ✅ Fetch fresh list
    const fetchUpdatedSupportingDocs = async () => {
      const serviceId = editingService?.id || newService?.id;
      if (!serviceId) return;

      try {
        const res = await fetch(`http://127.0.0.1:8001/api/supporting-documents/?service=${serviceId}`);
        if (!res.ok) throw new Error("Failed to fetch supporting documents");

        const data = await res.json();
        setSupportingDocs(data);
      } catch (err) {
        console.error("Error fetching updated supporting documents:", err);
      }
    };

    await fetchUpdatedSupportingDocs();
  };

  const handleDeleteSupportingDoc = async () => {
    if (!docToDelete) return;

    try {
      await fetch(`http://127.0.0.1:8001/api/supporting-documents/${docToDelete.id}/`, {
        method: "DELETE",
      });

      // Remove from local state
      setSupportingDocs((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== docToDelete.id)
      );

      // ✅ Just close the delete modal
      setDocToDelete(null);
      setShowDeleteModal(false); // ✅ ONLY close delete modal
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete document.");
    }
  };
  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setNewDocSelectValue("");

  }, [newService]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!serviceId) return;

    const fetchExistingSupportingDocs = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/supporting-documents/?service=${serviceId}`);
        if (!res.ok) throw new Error("Failed to fetch supporting documents");

        const data = await res.json();
        setSupportingDocs(data);
      } catch (err) {
        console.error("Error fetching existing supporting documents:", err);
      }
    };

    fetchExistingSupportingDocs();
  }, [editingService?.id]);

  const handleNewDocSubmit = async () => {
    if (!newDocData.name.trim()) return;
    try {
      setDocSubmitting(true);

      const res = await fetch("http://127.0.0.1:8001/api/documents/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDocData.name.trim(),
          categories: newDocData.categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          additional_details: newDocData.additional_details.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.id) {
        console.error("Full error response:", result);
        throw new Error(result.error || JSON.stringify(result));
      }

      const updatedDocs = await fetchDocuments();

setNewService((prev) => ({
  ...prev,
  required_documents: [
    ...(prev.required_documents || []),
    { document: docId, requirement_type: "original" }, // default to "original"
  ],
}));


      setNewDocData({ name: "", categories: "", additional_details: "" });
      setShowNewDocForm(false);
      setNewDocSelectValue(result.id.toString());
    } catch (err) {
      console.error("Error creating document:", err);
      alert("Error creating document: " + err.message);
    } finally {
      setDocSubmitting(false);
    }
  };

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
      <button type="button" className={styles.buttonAddLink} onClick={addLink}>
        Add Link
      </button>

      {/* === Required Documents Selection === */}
      <div className={styles.modalFormGroup}>
        {/* Selected Document Tags */}
        <div className={styles.selectedDocContainer}>
          {(newService.required_documents || []).map((docId) => {
            const doc = documents.find((d) => d.id === Number(docId));
            if (!doc) return null;
            return (
              <div key={doc.id} className={`${styles.selectedDocTag} ${styles.linkRow}`}>
                {doc.name}
                <button
                  type="button"
                  onClick={() =>
                    setNewService((prev) => ({
                      ...prev,
                      required_documents: prev.required_documents.filter(
                        (id) => Number(id) !== Number(doc.id)
                      ),
                    }))
                  }
                  className={styles.removeButton}
                  aria-label="Remove Document"
                >
                  <DeleteIcon className={styles.icon} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Dropdown to select new document */}
        {documents.filter(
          (d) => !(newService.required_documents || []).includes(d.id)
        ).length > 0 && (
            <select
              value={newDocSelectValue}
              onChange={(e) => {
                const docId = parseInt(e.target.value);
                if (!isNaN(docId)) {
                  setNewService((prev) => ({
                    ...prev,
                    required_documents: [...(prev.required_documents || []), docId],
                  }));
                  setNewDocSelectValue("");
                }
              }}
              className={styles.modalFormSelect}
            >
              <option value="" disabled>
                Select a document...
              </option>
              {documents
                .filter((doc) => !(newService.required_documents || []).includes(doc.id))
                .map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
            </select>
          )}

        {/* Add New Document Button */}
        <button
          type="button"
          onClick={() => setShowNewDocForm(true)}
          className={styles.buttonAddLink}
        >
          + Add New Document
        </button>
      </div>

      {/* === New Document Form === */}
      {showNewDocForm && (
        <div className={styles.modalFormGroup} style={{ marginTop: "1rem" }}>
          <input
            type="text"
            placeholder="Document Name"
            value={newDocData.name}
            onChange={(e) => setNewDocData({ ...newDocData, name: e.target.value })}
            className={styles.modalFormInput}
          />
          <input
            type="text"
            placeholder="Categories (comma separated)"
            value={newDocData.categories}
            onChange={(e) =>
              setNewDocData({ ...newDocData, categories: e.target.value })
            }
            className={styles.modalFormInput}
          />
          <textarea
            placeholder="Additional Details"
            value={newDocData.additional_details}
            onChange={(e) =>
              setNewDocData({ ...newDocData, additional_details: e.target.value })
            }
            className={styles.modalFormTextarea}
          />
          <button
            type="button"
            className={styles.buttonSubmit}
            onClick={handleNewDocSubmit}
            disabled={docSubmitting}
          >
            {docSubmitting ? "Saving..." : "Save Document"}
          </button>
        </div>
      )}
      
      <SupportingDocumentsSection
        editingService={editingService}
        supportingDocs={supportingDocs}
        setSupportingDocs={setSupportingDocs}
        setDocToDelete={setDocToDelete}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteSupportingDoc={handleDeleteSupportingDoc}
        handleSupportingDocsUpload={handleSupportingDocsUpload}
      />

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
