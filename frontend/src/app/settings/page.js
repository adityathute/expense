"use client";
import "./settings.css";
import { DeleteIcon } from "../components/Icons";
import styles from "../styles/components/modalForm.module.css";
import Link from "next/link";
import { ListTree, Store, LineChart, Server } from "lucide-react";

export default function Settings() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <p className="sub-text">Manage your business preferences and configurations.</p>

      <div className="settings-grid">
        {/* Recycle Bin */}
        <div className="setting-card">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <DeleteIcon className={styles.icon} />
            Recycle Bin
          </h2>
          <p>View and restore deleted items from your account.</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/recycle" style={{ width: "100%", maxWidth: "400px" }}>
              <button className="setting-card-link" style={{ width: "100%" }}>
                Open Recycle Bin
              </button>
            </Link>
          </div>
        </div>

        {/* Category Management */}
        <div className="setting-card">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <ListTree size={20} style={{ color: "#ff6b6b" }} />
            Category Management
          </h2>
          <p>Customize categories for tracking income, expenses, and services.</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/categories" style={{ width: "100%", maxWidth: "400px" }}>
              <button className="setting-card-link" style={{ width: "100%" }}>
                Manage Categories
              </button>
            </Link>
          </div>
        </div>

        {/* Shop Details */}
        <div className="setting-card">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Store size={20} style={{ color: "#91a7ff" }} />
            Shop Details
          </h2>
          <p>View and update your shop information including address, contact, and settings.</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/shop-details" style={{ width: "100%", maxWidth: "400px" }}>
              <button className="setting-card-link" style={{ width: "100%" }}>
                Manage Shop Details
              </button>
            </Link>
          </div>
        </div>

        {/* Analytics */}
        <div className="setting-card">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <LineChart size={20} style={{ color: "#f59f00" }} />
            Analytics
          </h2>
          <p>View business performance, income/expense trends, and generate reports.</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/analytics" style={{ width: "100%", maxWidth: "400px" }}>
              <button className="setting-card-link" style={{ width: "100%" }}>
                View Analytics
              </button>
            </Link>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="setting-card">
          <h2 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <Server size={20} style={{ color: "#63e6be" }} />
            Backup & Restore
          </h2>
          <p>Backup your data and restore previous versions to prevent data loss.</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/backup" style={{ width: "100%", maxWidth: "400px" }}>
              <button className="setting-card-link" style={{ width: "100%" }}>
                Backup & Restore
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
