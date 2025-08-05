"use client";

import React, { useEffect, useRef } from "react";
import { DeleteIcon } from "../components/Icons";
import styles from "../styles/components/modalForm.module.css";
import Select from "react-select";

export default function RequiredDocumentsSection({
    documents,
    newService,
    setNewService,
    newDocSelectValue,
    setNewDocSelectValue,
    showNewDocForm,
    setShowNewDocForm,
    newDocData,
    setNewDocData,
    docSubmitting,
    handleNewDocSubmit,
    editingService,
    setDescription,
}) {
    const safeValue = (val) =>
        val === 0 || val === "" || val === false ? "" : val ?? "";

    const hasInitialized = useRef(false);

    useEffect(() => {
        if (editingService && !hasInitialized.current) {
            hasInitialized.current = true; // run only once

            const mergedRequiredDocs = (editingService.requirements || []).map((req) => ({
                document: req.document.id,
                requirement_type: req.requirement_type?.toLowerCase() || "original",
                is_mandatory: req.is_mandatory ?? true,
            }));

            setNewService((prev) => ({
                ...prev,
                required_documents: mergedRequiredDocs,
            }));

            setDescription(editingService.description || "");
        }
    }, [editingService]);

    return (
        <div className={styles.modalFormGroup}>
            {/* === Required Documents Selection === */}

            {/* Selected Document Tags */}
            <div className={styles.selectedDocContainer}>
                {(newService.required_documents || []).map((docItem, index) => {
                    const docId = typeof docItem === "object" ? docItem.document : docItem;
                    const doc = documents.find((d) => d.id === docId);
                    if (!doc) return null;

                    const requirementType = typeof docItem === "object" ? docItem.requirement_type || "" : "";

                    return (
                        <div
                            key={doc.id}
                            className={`${styles.selectedDocTag} ${styles.linkRow}`}
                            style={{ alignItems: "center", gap: "0.5rem" }}
                        >
                            <span style={{ width: "55%", padding: "0.2rem" }}>{doc.name}</span>

                            <select
                                value={requirementType}
                                onChange={(e) => {
                                    const updatedDocs = [...(newService.required_documents || [])];
                                    const value = e.target.value;
                                    if (typeof docItem === "object") {
                                        updatedDocs[index] = { ...docItem, requirement_type: value };
                                    } else {
                                        updatedDocs[index] = { document: doc.id, requirement_type: value };
                                    }
                                    setNewService((prev) => ({ ...prev, required_documents: updatedDocs }));
                                }}
                                className={styles.modalFormSelectDocs}
                                style={{ marginLeft: "auto" }}
                            >
                                <option value="" disabled>Requirement Type</option>
                                <option value="original">Original</option>
                                <option value="xerox">Xerox</option>
                                <option value="both">Both</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => {
                                    const updatedDocs = [...(newService.required_documents || [])];
                                    updatedDocs.splice(index, 1);
                                    setNewService((prev) => ({
                                        ...prev,
                                        required_documents: updatedDocs,
                                    }));
                                }}
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
                (d) =>
                    !(newService.required_documents || []).some(
                        (docItem) =>
                            (typeof docItem === "object" ? docItem.document : docItem) === d.id
                    )
            ).length > 0 && (
                    <Select
                        value={documents.find((d) => d.id === parseInt(newDocSelectValue)) || null}
                        onChange={(selectedOption) => {
                            const docId = selectedOption?.value;
                            if (!isNaN(docId)) {
                                setNewService((prev) => ({
                                    ...prev,
                                    required_documents: [
                                        ...(prev.required_documents || []),
                                        { document: docId, requirement_type: "original", is_mandatory: true },
                                    ],
                                }));
                                setNewDocSelectValue("");
                            }
                        }}
                        options={documents
                            .filter(
                                (doc) =>
                                    !(newService.required_documents || []).some(
                                        (docItem) =>
                                            (typeof docItem === "object" ? docItem.document : docItem) === doc.id
                                    )
                            )
                            .map((doc) => ({
                                value: doc.id,
                                label: doc.name,
                            }))}
                        placeholder="Search and select a document..."
                        className={styles.modalFormSelect}
                    />
                )}

            {/* Add New Document Button */}
            <button
                type="button"
                onClick={() => setShowNewDocForm(true)}
                className={styles.buttonAddLink}
            >
                + Add New Document
            </button>

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
        </div>
    );
}
