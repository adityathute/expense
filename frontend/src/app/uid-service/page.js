"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../uid-service/styles.css"; // Your existing CSS
import StyledTable from "../components/StyledTable";

export default function UidTransactions() {
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false); // modal toggle
  const [entries, setEntries] = useState([]);
  const [enrollmentSuffix, setEnrollmentSuffix] = useState("");
  const [timeSuffix, setTimeSuffix] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    aadhaar_number: "",
    entry_type: "update",
    uid_type: "offline",
    update_type: "new_adhar",
    service_charge: 100,
    payment_type: "cash",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch entries
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-temp-entries/");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-temp-entries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowFormModal(false); // Close modal on submit
        fetchEntries();
        setFormData({
          full_name: "",
          mobile_number: "",
          aadhaar_number: "",
          entry_type: "update",
          uid_type: "offline",
          update_type: "new_adhar",
          service_charge: 100,
          payment_type: "cash",
        });
      } else {
        alert("Error Adding Entry");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while adding the entry.");
    }
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setEnrollmentSuffix("");
    setTimeSuffix("");
  };

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/uid-temp-entries/${id}/delete/`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEntries();
      } else {
        alert("Error deleting entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("An error occurred while deleting the entry.");
    }
  };

  const handleSubmitToUID = async () => {
    const payload = {
      full_name: selectedEntry.full_name,
      mobile_number: selectedEntry.mobile_number,
      aadhaar_number: selectedEntry.aadhaar_number || null,
      entry_type: selectedEntry.entry_type,
      uid_type: selectedEntry.uid_type,
      enrollment_suffix: enrollmentSuffix,
      entry_time: timeSuffix,
      service_charge: formData.service_charge,
      update_type: selectedEntry.entry_type === "update" ? selectedEntry.update_type : "new_adhar",
      payment_type: formData.payment_type,
    };

    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Success:", result);
        deleteEntry(selectedEntry.id);

        setFormData({
          full_name: "",
          mobile_number: "",
          aadhaar_number: "",
          entry_type: "update",
          uid_type: "offline",
          update_type: "new_adhar",
          service_charge: 100,
          payment_type: "cash",
        });

        window.location.reload();
      } else {
        alert("Error Moving Entry: " + (result.detail || JSON.stringify(result)));
      }
    } catch (error) {
      console.error("Error moving entry:", error);
      alert("An error occurred while moving the entry.");
    }
  };

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <button className="new-entry-btn" onClick={() => setShowFormModal(true)}>
            New Temp Entry
          </button>

          {/* Modal Popup Form */}
          {showFormModal && (
            <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>New Temporary Entry</h2>
                <form className="temp-entry-form" onSubmit={handleSubmit}>
                  <label>Full Name:</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />

                  <label>Mobile Number:</label>
                  <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />

                  <label>Aadhaar Number (Optional):</label>
                  <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} />

                  <label>Entry Type:</label>
                  <select name="entry_type" value={formData.entry_type} onChange={handleChange}>
                    <option value="new">New</option>
                    <option value="update">Update</option>
                  </select>

                  {formData.entry_type === "update" && (
                    <>
                      <label>Update Type:</label>
                      <select name="update_type" value={formData.update_type} onChange={handleChange}>
                        <option value="">Select Update Type</option>
                        <option value="mobile_change">Mobile Number Change</option>
                        <option value="biometric_change">Biometric Change</option>
                        <option value="name_change">Name Change</option>
                        <option value="address_change">Address Change</option>
                        <option value="dob_change">Date of Birth Change</option>
                      </select>
                    </>
                  )}

                  <label>UID Type:</label>
                  <select name="uid_type" value={formData.uid_type} onChange={handleChange}>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="ucl">UCL</option>
                  </select>

                  <button type="submit" className="submit-btn">Submit Entry</button>
                  <button type="button" className="close-btn" onClick={() => setShowFormModal(false)}>Close</button>
                </form>
              </div>
            </div>
          )}

          {/* Temp Entries Table */}
          <h2>Temp ID Entries</h2>
          <StyledTable
            headers={[
              "ID",
              "Full Name",
              "Mobile Number",
              "Entry Type",
              "UID Type",
              "Update Type",
            ]}
            columns={[
              "id",
              "full_name",
              "mobile_number",
              "entry_type",
              "uid_type",
              "update_type",
            ]}
            data={entries}
            renderCell={(row, column) => {
              if (column === "update_type") {
                return row.entry_type === "new" ? "-" : row.update_type;
              }
              return row[column] ?? "-";
            }}
            onEdit={(row) => handleSelectEntry(row)}
            onDelete={(row) => deleteEntry(row.id)}
          />

          {/* Enrollment Suffix Form - show when entry selected */}
          {selectedEntry && (
            <div className="enrollment-form">
              <h3>Move to UID System</h3>

              <p><strong>Entry ID:</strong> {selectedEntry.id}</p>
              <p><strong>Name:</strong> {selectedEntry.full_name}</p>

              <label>Enrollment Suffix (5 digits):</label>
              <input
                type="text"
                value={enrollmentSuffix}
                onChange={(e) => setEnrollmentSuffix(e.target.value)}
                maxLength={5}
                required
              />

              {selectedEntry.entry_type === "new" && (
                <>
                  <label>Entry Time (HHMMSS - 6 digits):</label>
                  <input
                    type="text"
                    value={timeSuffix}
                    onChange={(e) => setTimeSuffix(e.target.value)}
                    maxLength={6}
                    required
                  />
                </>
              )}

              <label>Payment Type:</label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>

              <label>Service Charge (Default: 100 Rs):</label>
              <input
                type="number"
                name="service_charge"
                value={formData.service_charge}
                onChange={handleChange}
              />

              <button onClick={handleSubmitToUID}>Submit to UID System</button>
              <button onClick={() => setSelectedEntry(null)}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
