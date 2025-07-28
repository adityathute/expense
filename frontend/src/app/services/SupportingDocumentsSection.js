"use client";

import React, { useRef } from "react";
import { DeleteIcon } from "../components/Icons";
import styles from "../styles/components/modalForm.module.css";

export default function SupportingDocumentsSection({
    editingService,
    supportingDocs,
    setDocToDelete,
    setShowDeleteModal,
    handleSupportingDocsUpload,
}) {
    const fileInputRef = useRef(null);

    const handleDeleteClick = (doc) => {
        setDocToDelete({ ...doc }); // Force a shallow copy (new reference)
        setShowDeleteModal(true);
    };

    return (
        <>
            {editingService && (
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
            )}

            {supportingDocs.length > 0 && (
                <div className={styles.modalFormGroup}>
                    <ul className={styles.uploadedDocList}>
                        {supportingDocs.map((doc, idx) => (
                            <li key={idx} className={styles.supportingDocItem}>
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
        </>
    );
}
