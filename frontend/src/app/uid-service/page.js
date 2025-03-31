"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../uid-service/styles.css"; // Import the CSS

export default function UidTransactions() {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [enrollmentSuffix, setEnrollmentSuffix] = useState("");
  const [timeSuffix, setTimeSuffix] = useState(""); // New state for time entry
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    aadhaar_number: "",
    entry_type: "update",
    uid_type: "offline",
    update_type: "new_adhar",
    service_charge: 100, // Default service charge
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch Temp Entries
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

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle New Temp Entry Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-temp-entries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        fetchEntries(); // Fetch entries again after successful submission

        // Reset the form data after submission
        setFormData({
          full_name: "",
          mobile_number: "",
          aadhaar_number: "",
          entry_type: "update",
          uid_type: "offline",
          update_type: "new_adhar",
          service_charge: 100, // Reset service charge to default
        });
      } else {
        alert("Error Adding Entry");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while adding the entry.");
    }
  };

  // Select an Entry for Enrollment Suffix
  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setEnrollmentSuffix(""); // Reset Suffix Field
    setTimeSuffix(""); // Reset Time Field
  };

  // Function to delete the entry after it is moved
  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/uid-temp-entries/${id}/delete/`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEntries(); // Fetch updated list of entries
      } else {
        alert("Error deleting entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("An error occurred while deleting the entry.");
    }
  };

  // Submit Entry to UID System with Enrollment Suffix & Time
  const handleSubmitToUID = async () => {
    const payload = {
      full_name: selectedEntry.full_name,
      mobile_number: selectedEntry.mobile_number,
      aadhaar_number: selectedEntry.aadhaar_number || null,
      entry_type: selectedEntry.entry_type,
      uid_type: selectedEntry.uid_type,
      enrollment_suffix: enrollmentSuffix,
      entry_time: selectedEntry.entry_type === "new" ? timeSuffix : null,
      service_charge: formData.service_charge, // Use the service charge from the form
      update_type: selectedEntry.entry_type === "update" ? selectedEntry.update_type : "new_adhar",
    };

    console.log("Submitting Payload:", payload);

    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();  // Capture the response

      if (response.ok) {
        console.log("Success:", result);

        // Now delete the temp entry after successful submission
        deleteEntry(selectedEntry.id);

        // Reset the form data and refresh the page after success
        setFormData({
          full_name: "",
          mobile_number: "",
          aadhaar_number: "",
          entry_type: "update",
          uid_type: "offline",
          update_type: "new_adhar",
          service_charge: 100, // Reset service charge to default
        });

        // Refresh the page to fetch updated data
        window.location.reload();
      } else {
        console.error("Error:", result);
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
          <button className="new-entry-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "New Temp Entry"}
          </button>

          {/* New Temp Entry Form */}
          {showForm && (
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

              {/* Show Update Type dropdown only if entry_type is "update" */}
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

              <button type="submit">Submit Entry</button>
            </form>
          )}

          {/* Temp Entries Table */}
          <h2>Temp ID Entries</h2>
          <table className="uid-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Entry Type</th>
                <th>UID Type</th>
                <th>Update Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.id} onClick={() => handleSelectEntry(entry)} style={{ cursor: "pointer" }}>
                    <td>{entry.id}</td>
                    <td>{entry.full_name}</td>
                    <td>{entry.mobile_number}</td>
                    <td>{entry.entry_type}</td>
                    <td>{entry.uid_type}</td>
                    <td>{entry.update_type}</td>
                    <td>
                      <button className="use-entry-btn">Use Entry</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No entries found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Enrollment Suffix Form */}
          {selectedEntry && (
            <div className="enrollment-form">
              <h3>Add Enrollment Suffix & Entry Time</h3>

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
              <label>Service Charge (Default: 100 Rs):</label>
              <input
                type="number"
                name="service_charge"
                value={formData.service_charge}
                onChange={handleChange}
              />

              <button onClick={handleSubmitToUID}>Submit to UID System</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
