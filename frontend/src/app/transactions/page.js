"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "../uid-service/styles.css"; // Import the CSS

export default function UidTransactions() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/");
      if (response.ok) {
        const data = await response.json();
        
        // Sort entries by created_at in descending order (most recent first)
        const sortedEntries = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEntries(sortedEntries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Transactions</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="uid-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Mobile Number</th>
                  <th>Aadhaar Number</th>
                  <th>Entry Type</th>
                  <th>UID Type</th>
                  <th>Update Type</th>
                  <th>Service Charge</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.id}</td>
                      <td>{entry.full_name}</td>
                      <td>{entry.mobile_number}</td>
                      <td>{entry.aadhaar_number}</td>
                      <td>{entry.entry_type}</td>
                      <td>{entry.uid_type}</td>
                      <td>{entry.update_type}</td>
                      <td>{entry.service_charge}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
