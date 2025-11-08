"use client";

import React, { useState } from "react";
import { Repeat } from "lucide-react";
import "./style.css";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import RecurringForm from "./RecurringForm";

export default function Recurring() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="page-container">
      <HeaderWithNewButton
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Repeat size={22} color="#6ecb63" />
            <span>Recurring</span>
          </span>
        }
        buttonLabel="Add Recurring"
        onClick={handleOpenModal}
      />

      {/* ✅ Pass isOpen prop here */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Add Recurring Payment"
      >
        <RecurringForm onClose={handleCloseModal} />
      </Modal>
    </div>
  );
}
