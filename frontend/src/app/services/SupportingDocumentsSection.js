"use client";

import React, { useRef } from "react";
import { DeleteIcon } from "../components/Icons";
import { DeleteSupportingDocModal } from "./DeleteSupportingDocModal";
import styles from "../styles/components/modalForm.module.css";

export default function SupportingDocumentsSection({
    editingService,
    supportingDocs,
    setSupportingDocs,
    docToDelete,
    setDocToDelete,
    showDeleteModal,
    setShowDeleteModal,
    handleDeleteSupportingDoc,
    handleSupportingDocsUpload,
}) {
    const fileInputRef = useRef(null);

    const handleDeleteClick = (doc) => {
        console.log("🧪 Clicked Delete, doc:", doc);
        setDocToDelete(doc); // useEffect will now handle modal
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
                    <h4 className={styles.modalFormLabel}>Supporting Documents:</h4>
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

            {/* ✅ Only render modal when both flags are true */}
            {showDeleteModal && docToDelete && (
                <DeleteSupportingDocModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    doc={docToDelete}
                    onConfirm={async () => {
                        console.log("🧪 Parent onConfirm called");
                        await handleDeleteSupportingDoc(docToDelete.id); // pass explicitly
                        setShowDeleteModal(false);
                        setDocToDelete(null); // clear after delete
                    }}
                />
            )}
        </>
    );
}
