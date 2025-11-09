"use client";
import "./settings.css";
import { Settings as SettingsIcon, Database, RotateCcw } from "lucide-react";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import { useState } from "react";
import { UserCircle2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { DeleteIcon } from "../components/Icons";
import styles from "../styles/components/modalForm.module.css";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const user = {
    name: "Aditya Thute",
    email: "aditya@shivanyams.com",
    isVerified: true,
  };

  return (
    <div className="apple-settings">
      <HeaderWithNewButton
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <SettingsIcon size={22} color="#ced4da" />
            <span>Settings</span>
          </span>
        }
      />

      {/* Profile Section — No Background */}
      <div className="profile-header">
        <div className="profile-left">
          <img src="/assets/logo.png" alt="App Logo" className="profile-logo" />
          <div className="profile-info">
            <h2>{user.name}</h2>
            <div className="profile-email">
              <span>{user.email}</span>
              {user.isVerified ? (
                <CheckCircle size={16} color="#51cf66" title="Verified" />
              ) : (
                <XCircle size={16} color="#ff6b6b" title="Not Verified" />
              )}
            </div>
          </div>
        </div>

        <Link href="/edit-profile" className="edit-profile-btn">
          Edit Profile
        </Link>
      </div>

      {/* Preferences Section */}
      <div className="settings-section">
        <h3>Preferences</h3>

        <div className="settings-toggle">
          <span>Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="settings-toggle">
          <span>Notifications</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider" />
          </label>
        </div>

        <div className="settings-toggle">
          <span>Auto Backup</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={() => setAutoBackup(!autoBackup)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* 🗄️ Backup & Restore Section — same layout style */}
      <div className="settings-section">
        <h3>Backup & Restore</h3>

        <div className="backup-row">
          <p className="backup-text">
            Securely back up your data or restore from saved backups.
          </p>

          <Link href="/backup" className="backup-btn">
            <Database size={16} />
            <span>Go to Backup</span>
          </Link>
        </div>
      </div>

      {/* 🗑️ Recycle Bin Section — same layout style */}
      <div className="settings-section">
        <h3>Recycle Bin</h3>

        <div className="backup-row">
          <p className="backup-text">
            You can restore or permanently remove them.
          </p>

          <Link href="/recycle" className="recycle-btn">
            <DeleteIcon className={styles.icon} />
            <span>Go to Recycle Bin</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
