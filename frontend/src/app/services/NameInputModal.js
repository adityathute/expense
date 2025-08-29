// app/services/NameInputModal.js
"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/components/modalForm.module.css";

export function NameInputModal({ file, isOpen, onClose, onSubmit }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (file) {
            setName(file.name.replace(/\.[^/.]+$/, "")); // remove file extension as default
        }
    }, [file]);

    if (!isOpen || !file) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ marginTop: "1rem" }}>
                <input
                    type="text"
                    className={styles.modalFormInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter document name"
                />
                <div className={styles.modalActions}>
                    <button
                        onClick={() => {
                            if (name.trim()) onSubmit(name.trim());
                        }}
                        className={styles.buttonAddLink}
                        style={{ marginRight: "0.75rem" }}

                    >
                        Submit
                    </button>
                    <button
                        onClick={onClose}
                        className={styles.buttonCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
