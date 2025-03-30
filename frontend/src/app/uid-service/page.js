"use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../uid-service/styles.css"; // Import the CSS

export default function UidTransactions() {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [enrollmentSuffix, setEnrollmentSuffix] = useState("");
  const [timeSuffix, setTimeSuffix] = useState(""); // ✅ New state for time entry
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    aadhaar_number: "",
    entry_type: "new",
    uid_type: "offline",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch Temp Entries
  const fetchEntries = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-temp-entries/");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
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
        alert("Temp Entry Added Successfully!");
        setShowForm(false);
        fetchEntries();
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

  // Submit Entry to UID System with Enrollment Suffix & Time (for new entries)
  const handleSubmitToUID = async () => {
    if (!enrollmentSuffix.match(/^\d{5}$/)) {
      alert("Enrollment suffix must be exactly 5 digits!");
      return;
    }

    if (selectedEntry.entry_type === "new") {
      if (!timeSuffix.match(/^\d{6}$/)) {
        alert("For new entries, Entry Time must be exactly 6 digits (HHMMSS)!");
        return;
      }
    }

    const payload = {
      full_name: selectedEntry.full_name,
      mobile_number: selectedEntry.mobile_number,
      aadhaar_number: selectedEntry.aadhaar_number || null,
      entry_type: selectedEntry.entry_type,
      uid_type: selectedEntry.uid_type,
      enrollment_suffix: enrollmentSuffix, // ✅ 5-digit suffix
      entry_time: selectedEntry.entry_type === "new" ? timeSuffix : null, // ✅ Manual Entry Time
    };

    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetch(`http://127.0.0.1:8001/api/uid-temp-entries/${selectedEntry.id}/delete/`, {
          method: "DELETE",
        });

        alert("Entry Moved Successfully and Temp Entry Deleted!");
        setSelectedEntry(null);
        fetchEntries();
      } else {
        alert("Error Moving Entry to UID System");
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
                    <td>
                      <button className="use-entry-btn">Use Entry</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No entries found</td>
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

              <button onClick={handleSubmitToUID}>Submit to UID System</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
