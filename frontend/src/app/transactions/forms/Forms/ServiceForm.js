"use client";

import React from "react";
import styles from "../../../styles/components/modalForm.module.css";

export default function ServiceForm({ serviceOptions, selectedService, setSelectedService }) {
  return (
    <>
      <label>Select Service</label>
      <select
        value={selectedService}
        className={styles.modalFormInput}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value="">--Select Service--</option>
        {serviceOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </>
  );
}
