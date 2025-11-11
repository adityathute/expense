"use client";

import "./backup.css";

export default function BackupPage() {
    const handleBackup = () => {
        alert("Backup started..."); // Replace with your API call
    };

    const handleRestore = () => {
        alert("Restore started..."); // Replace with your API call
    };

    return (
        <div className="backup-page">
            <h1>Backup & Restore</h1>
            <p className="sub-text">
                Backup your data to secure storage and restore previous versions when needed.
            </p>

            <div className="backup-grid">
                <div className="backup-card">
                    <h2>Backup Data</h2>
                    <p>Create a complete backup of all your data, including services, categories, and settings.</p>
                    <div className="backup-btn-container">
                        <button className="backup1-btn" onClick={handleBackup}>
                            Start Backup
                        </button>
                    </div>
                </div>

                <div className="backup-card">
                    <h2>Restore Data</h2>
                    <p>Restore your data from a previous backup to recover lost information or revert changes.</p>
                    <div className="backup-btn-container">
                        <button className="restore-btn" onClick={handleRestore}>
                            Start Restore
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
