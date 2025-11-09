"use client";

import React, { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import "./style.css";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import Modal from "../components/Modal";
import RecurringForm from "./RecurringForm";
import StyledTable from "../components/StyledTable";

export default function Recurring() {
  const [showModal, setShowModal] = useState(false);
  const [recurringList, setRecurringList] = useState([]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // ✅ Fetch recurring payments
  const fetchRecurring = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/recurring-payments/");
      const data = await response.json();
      setRecurringList(data);
    } catch (error) {
      console.error("❌ Error fetching recurring payments:", error);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  // ✅ Handle delete
  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return;

    try {
      await fetch(`http://127.0.0.1:8001/api/recurring-payments/${row.id}/`, {
        method: "DELETE",
      });
      setRecurringList((prev) => prev.filter((item) => item.id !== row.id));
    } catch (error) {
      console.error("❌ Failed to delete recurring payment:", error);
    }
  };

  // ✅ Handle edit (optional later)
  const handleEdit = (row) => {
    console.log("Edit clicked:", row);
  };

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

      {/* ✅ Reusable table */}
      <div style={{ marginTop: "1rem" }}>
        <StyledTable
          headers={[
            "Name",
            "Type",
            "Category",
            "Actual₹",
            "Estimated₹",
            "Frequency",
            "Due Date",
          ]}
          columns={[
            "name",
            "type",
            "category",
            "actual_amount",
            "estimated_amount",
            "frequency",
            "next_due_date",
          ]}
          data={recurringList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getRowKey={(row) => row.id}
          emptyText="No recurring payments found."
        />
      </div>

      {/* ✅ Modal for creating new recurring entry */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          handleCloseModal();
          fetchRecurring(); // ✅ Refresh table after closing modal
        }}
        title="Add Recurring Payment"
      >
        <RecurringForm
          onClose={() => {
            handleCloseModal();
            fetchRecurring(); // ✅ Refresh table after saving
          }}
        />
      </Modal>
    </div>
  );
}
