"use client";
import React from "react";
import Link from "next/link";

export default function SettingCard({ icon: Icon, title, description, href, buttonText, color }) {
  return (
    <div className="setting-card">
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={20} style={{ color: color || "#ccc" }} />
        {title}
      </h2>
      <p>{description}</p>
      {href && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href={href} style={{ width: "100%", maxWidth: "300px" }}>
            <button className="setting-card-link" style={{ width: "100%" }}>
              {buttonText || "Open"}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
