"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/components/modalForm.module.css";
import { DeleteIcon } from "../components/Icons";
import SupportingDocumentsSection from "./SupportingDocumentsSection";
import RequiredDocumentsSection from "./RequiredDocumentsSection";
import { DeleteSupportingDocModal } from "./DeleteSupportingDocModal"; // ✅ Make sure this import is at the top

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
  const [docToDelete, setDocToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const serviceId = editingService?.id || newService?.id;
  const isPhotoInvalid =
    newService.passport_required &&
    (!newService.photo_count || newService.photo_count <= 0);

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

  const fetchUpdatedSupportingDocs = async () => {
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

  useEffect(() => {
    fetchUpdatedSupportingDocs();
  }, [serviceId]);

  const handleSupportingDocsUpload = async (files) => {
    const uploaded = [];

    for (const file of files) {
      const name = prompt(`Enter name for: ${file.name}`);
      if (!name) continue;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      let supportingDocumentId = null;

      try {
        // STEP 1: Upload the SupportingDocument
        const res = await fetch("http://127.0.0.1:8001/api/supporting-documents/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const doc = await res.json();
        supportingDocumentId = doc.id;

        // STEP 2: Link it to the service via through model
        const service = editingService?.id || newService?.id;
        if (service && supportingDocumentId) {
          const linkRes = await fetch("http://127.0.0.1:8001/api/service-supporting-documents/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              service,
              supporting_document_id: supportingDocumentId, // 🔄 this is the fix
            }),
          });

          if (!linkRes.ok) {
            const errResponse = await linkRes.json().catch(() => ({}));
            console.error("Link failed:", errResponse);
            throw new Error("Failed to link document to service");
          }

          uploaded.push(doc);
        }
      } catch (err) {
        console.error("Upload/link failed:", err);
      }
    }

    // Fetch updated documents after all uploads
    await fetchUpdatedSupportingDocs();
  };

  const handleDeleteSupportingDoc = async () => {
    if (!docToDelete) {
      return;
    }

    try {
      // STEP 1: Unlink from service
      const unlinkRes = await fetch(`http://127.0.0.1:8001/api/service-supporting-documents/unlink/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceId,
          supporting_document_id: docToDelete.id,
        }),
      });

      if (!unlinkRes.ok) {
        const errData = await unlinkRes.json().catch(() => ({}));
        console.error("❌ Failed to unlink document from service:", errData);
        throw new Error("Unlink failed");
      }

      // STEP 2: Update frontend state only
      setSupportingDocs((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== docToDelete.id)
      );

      setDocToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      alert("Failed to unlink supporting document.");
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
  }, [serviceId]); // <-- updated dependency


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
          {
            document: result.id, // ✅ use the actual ID from the API response
            requirement_type: "original",
            is_mandatory: true,
          },
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

      {/* === Passport Required & Photo Count (Row) === */}
      <div className={styles.passportRow}>
        <label className={styles.passportLabel}>
          <input
            type="checkbox"
            name="passport_required"
            checked={!!newService.passport_required}
            onChange={(e) => {
              const isChecked = e.target.checked;

              setNewService((prev) => ({
                ...prev,
                passport_required: isChecked,
                photo_count: isChecked
                  ? prev.photo_count > 0
                    ? prev.photo_count // keep existing if already set
                    : 1 // default to 1
                  : "", // clear if unchecked
              }));
            }}
          />
          Passport Photo
        </label>

        {newService.passport_required && (
          <input
            type="number"
            name="photo_count"
            value={safeValue(newService.photo_count)}
            onChange={(e) =>
              setNewService((prev) => ({
                ...prev,
                photo_count: parseInt(e.target.value || "0", 10),
              }))
            }
            placeholder="No. of Photos"
            className={`${styles.modalFormInput} ${styles.passportPhotoInput}`}
            spellCheck={false}
            min={0}
          />
        )}
      </div>

      {/* === Required Documents Section === */}
      <RequiredDocumentsSection
        documents={documents}
        newService={newService}
        setNewService={setNewService}
        newDocSelectValue={newDocSelectValue}
        setNewDocSelectValue={setNewDocSelectValue}
        showNewDocForm={showNewDocForm}
        setShowNewDocForm={setShowNewDocForm}
        newDocData={newDocData}
        setNewDocData={setNewDocData}
        docSubmitting={docSubmitting}
        handleNewDocSubmit={handleNewDocSubmit}
        editingService={editingService}
        setDescription={setDescription}
      />

      {/* === Supporting Documents Section === */}
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
        <button
          type="submit"
          className={styles.buttonSubmit}
          disabled={isPhotoInvalid}
        >
          {editingService ? "Update Service" : "Create Service"}
        </button>

      </div>

      {/* === Delete Supporting Document Modal === */}
      {showDeleteModal && docToDelete && (
        <DeleteSupportingDocModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDocToDelete(null);
          }}
          doc={docToDelete}
          onConfirm={async () => {
            await handleDeleteSupportingDoc(); // this uses your already defined function
          }}
        />
      )}
    </form>
  );
}
