// settings/page.js
"use client";
// import "./settings.css";

export default function Settings() {
  return (
    <div className="settings">
      <h1>Settings</h1>
      <p className="sub-text">Manage your business preferences and configurations.</p>

      <div className="settings-grid">
        <div className="setting-card">
          <h2>🧾 Business Profile</h2>
          <p>Update your shop name, address, and contact details.</p>
          <button>Edit Profile</button>
        </div>

        <div className="setting-card">
          <h2>📂 Category Management</h2>
          <p>Customize categories for tracking income, expenses, and services.</p>
          <button>Manage Categories</button>
        </div>

        <div className="setting-card">
          <h2>💳 Payment Methods</h2>
          <p>Add or modify payment methods like cash, online, or UPI.</p>
          <button>Manage Payments</button>
        </div>

        <div className="setting-card">
          <h2>🔐 Security</h2>
          <p>Update password, enable 2FA, and manage user permissions.</p>
          <button>Security Settings</button>
        </div>

        <div className="setting-card">
          <h2>⚙️ App Preferences</h2>
          <p>Change theme, date format, default views, etc.</p>
          <button>Configure</button>
        </div>
      </div>
    </div>
  );
}
