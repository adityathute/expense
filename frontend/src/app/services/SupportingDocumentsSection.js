"use client";

import React, { useEffect, useRef, useState } from "react";
import { DeleteIcon } from "../components/Icons";
import styles from "../styles/components/modalForm.module.css";
import { DeleteSupportingDocModal } from "./DeleteSupportingDocModal";

export default function SupportingDocumentsSection({ editingService, newService }) {
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);
  const [allSupportingDocs, setAllSupportingDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState("");
  const serviceId = editingService?.id || newService?.id;

  const fetchAllSupportingDocs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/supporting-documents/");
      if (!res.ok) throw new Error("Failed to fetch all supporting docs");
      const data = await res.json();
      setAllSupportingDocs(data);
    } catch (err) {
      console.error("Error fetching all supporting documents:", err);
    }
  };

  useEffect(() => {
    fetchAllSupportingDocs();
  }, []);

  const unlinkedDocs = allSupportingDocs.filter(
    (doc) => !supportingDocs.find((d) => d.id === doc.id)
  );

  const fetchUpdatedSupportingDocs = async () => {
    if (!serviceId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/supporting-documents/?service=${serviceId}`);
      if (!res.ok) throw new Error("Failed to fetch supporting documents");
      const data = await res.json();
      setSupportingDocs(data);
    } catch (err) {
      console.error("Error fetching supporting documents:", err);
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

      try {
        const res = await fetch("http://127.0.0.1:8001/api/supporting-documents/", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const doc = await res.json();

        const linkRes = await fetch("http://127.0.0.1:8001/api/service-supporting-documents/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: serviceId,
            supporting_document_id: doc.id,
          }),
        });

        if (!linkRes.ok) {
          const errResponse = await linkRes.json().catch(() => ({}));
          console.error("Link failed:", errResponse);
          throw new Error("Failed to link document to service");
        }

        uploaded.push(doc);
      } catch (err) {
        console.error("Upload/link failed:", err);
      }
    }

    await fetchUpdatedSupportingDocs();
  };

  const handleDeleteSupportingDoc = async () => {
    if (!docToDelete) return;

    try {
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

      setSupportingDocs((prev) =>
        prev.filter((doc) => doc.id !== docToDelete.id)
      );
      setDocToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      alert("Failed to unlink supporting document.");
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete({ ...doc });
    setShowDeleteModal(true);
  };

  return (
    <>
      {editingService && (
        <div style={{ marginBottom: "0.9rem" }}>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                handleSupportingDocsUpload(files).then(() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                });
              }
            }}
            className={styles.inputFileModern}
          />
        </div>
      )}

      {editingService && unlinkedDocs.length > 0 && (
        <div className={styles.modalFormGroup}>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className={styles.modalFormInput}
          >
            <option value="">Select existing supporting document</option>
            {unlinkedDocs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.buttonAddLink}
            onClick={async () => {
              if (!selectedDocId) return;
              try {
                const res = await fetch("http://127.0.0.1:8001/api/service-supporting-documents/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    service: serviceId,
                    supporting_document_id: parseInt(selectedDocId),
                  }),
                });
                if (!res.ok) throw new Error("Failed to link existing document");
                await fetchUpdatedSupportingDocs(); // refresh UI
                setSelectedDocId(""); // reset
              } catch (err) {
                alert("Error linking document: " + err.message);
              }
            }}
          >
            Link Document
          </button>
        </div>
      )}

      {supportingDocs.length > 0 && (
        <div className={styles.modalFormGroup}>
          <ul className={styles.uploadedDocList}>
            {supportingDocs.map((doc) => (
              <li key={doc.id} className={styles.supportingDocItem}>
                <span>
                  {doc.file ? (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.docLink}
                    >
                      {doc.name}
                    </a>
                  ) : (
                    <span>{doc.name}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(doc)}
                  className={styles.removeButton}
                  aria-label="Remove Supporting Document"
                >
                  <DeleteIcon className={styles.icon} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDeleteModal && docToDelete && (
        <DeleteSupportingDocModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDocToDelete(null);
          }}
          doc={docToDelete}
          onConfirm={handleDeleteSupportingDoc}
        />
      )}
    </>
  );
}
