"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Link from "next/link";

export default function AddTransactions() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    aadhaarNumber: "",
    mobileNumber: "",
    updateType: "",
    dob: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8001/api/generate-pdf/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Status Code:", res.status);

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend Error:", err);
        alert(err.error || "Failed to generate PDF");
        return;
      }

      const blob = await res.blob();
      console.log("Blob received:", blob);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "aadhaar_form.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Could not connect to the backend");
    }
  };


  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Link href="/uid-service">
            <button className="btn btn-primary">Aadhaar</button>
          </Link>

          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            Fill Form
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="form-box">
              <h2>Fill Aadhaar Update Form</h2>
              <label>Full Name:</label>
<input
  type="text"
  name="name"
  value={formData.name}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      name: e.target.value.toUpperCase(), // Force capital letters
    }))
  }
  required
/>

              <label>Form Name: Aadhaar Enrolment / Update</label>

              <label>Aadhaar Number:</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                required
              />

              <label>Mobile Number:</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />

              <label>Update Type:</label>
              <select
                name="updateType"
                value={formData.updateType}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="dob">Date of Birth</option>
                <option value="address">Address</option>
                <option value="mobile">Mobile Number</option>
                <option value="email">Email</option>
              </select>

              {formData.updateType === "dob" && (
                <>
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </>
              )}

              <button type="submit" className="btn btn-primary">
                Generate & Download PDF
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
