// shop-details/page.js
"use client";

import { useState } from "react";
import "./styles.css"; // make sure this path matches your project

function formatDate(d) {
  return d.toLocaleDateString();
}
function formatTime(t) {
  if (!t) return "--:--";
  return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function calcHours(checkIn, checkOut, date) {
  if (!checkIn || !checkOut) return null;
  const inDt = new Date(date);
  inDt.setHours(checkIn.getHours(), checkIn.getMinutes(), 0, 0);
  const outDt = new Date(date);
  outDt.setHours(checkOut.getHours(), checkOut.getMinutes(), 0, 0);
  const diffMs = outDt - inDt;
  if (diffMs <= 0) return null;
  const hrs = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${hrs}h ${mins}m`;
}

export default function Dashboard() {
  // --- Mocked initial data (replace with props / data fetching) ---
  const today = new Date();
  const [shop, setShop] = useState({
    id: 1,
    name: "Aditya Stationery & Prints",
    owner_name: "Aditya Thute",
    contact_number: "9876543210",
    email: "owner@example.com",
    address: "123 Main Road, Mumbai",
    created_at: new Date("2024-06-01T09:00:00"),
  });

  const [shopAttendance, setShopAttendance] = useState({
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    opened_by: "Aditya Thute",
    open_time: new Date(today.setHours(9, 0, 0, 0)),
    close_time: null,
    remarks: "",
  });

  const [staff, setStaff] = useState([
    {
      id: 1,
      name: "Chetan",
      position: "Assistant",
      contact_number: "7744886212",
      is_active: true,
      attendance: {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: "Present",
        check_in_time: new Date(today.setHours(9, 15, 0, 0)),
        check_out_time: null,
        remarks: "",
      },
    },
    {
      id: 2,
      name: "Ramesh",
      position: "Helper",
      contact_number: "8123456789",
      is_active: true,
      attendance: {
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        status: "Absent",
        check_in_time: null,
        check_out_time: null,
        remarks: "Sick",
      },
    },
  ]);

  // UI state for simple forms
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [showEditShop, setShowEditShop] = useState(false);
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [attendanceStaffId, setAttendanceStaffId] = useState(null);

  // --- Handlers (mock local behavior) ---
  function handleOpenShop() {
    setShopAttendance((s) => ({
      ...s,
      opened_by: shop.owner_name || "Owner",
      open_time: new Date(),
      close_time: null,
    }));
  }

  function handleCloseShop() {
    setShopAttendance((s) => ({
      ...s,
      close_time: new Date(),
    }));
  }

  function handleAddStaff(e) {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const id = staff.length ? Math.max(...staff.map((s) => s.id)) + 1 : 1;
    setStaff((prev) => [
      ...prev,
      {
        id,
        name: newStaffName.trim(),
        position: "Staff",
        contact_number: "",
        is_active: true,
        attendance: {
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          status: "Absent",
          check_in_time: null,
          check_out_time: null,
          remarks: "",
        },
      },
    ]);
    setNewStaffName("");
    setShowAddStaff(false);
  }

  function toggleStaffPresent(staffId) {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        if (s.attendance.status === "Present") {
          // mark absent
          return {
            ...s,
            attendance: { ...s.attendance, status: "Absent", check_in_time: null, check_out_time: null },
          };
        } else {
          // mark present with check-in now
          return {
            ...s,
            attendance: { ...s.attendance, status: "Present", check_in_time: new Date(), check_out_time: null },
          };
        }
      })
    );
  }

  function addCheckOut(staffId) {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        if (s.attendance.status !== "Present") return s;
        return {
          ...s,
          attendance: { ...s.attendance, check_out_time: new Date() },
        };
      })
    );
  }

  function handleUpdateShop(e) {
    e.preventDefault();
    // For demo: we'll just close edit panel (you can update via API)
    setShowEditShop(false);
  }

  function handleAddAttendance(e) {
    e.preventDefault();
    // Simple mock: set staff present with check-in now
    if (!attendanceStaffId) return;
    toggleStaffPresent(Number(attendanceStaffId));
    setShowAddAttendance(false);
    setAttendanceStaffId(null);
  }

  return (
    <div className="sd-page">
      <header className="sd-header">
        <div className="sd-head-left">
          <h1>{shop.name}</h1>
          <p className="muted">Manage shop details — quick overview</p>
        </div>
        <div className="sd-head-actions">
          <button className="btn primary" onClick={() => setShowEditShop(true)}>
            Edit Shop
          </button>
          <button className="btn" onClick={() => setShowAddStaff(true)}>
            + Add Staff
          </button>
        </div>
      </header>

      <main className="sd-grid">
        {/* SHOP CARD */}
        <section className="card shop-card">
          <div className="card-row">
            <div>
              <h2 className="accent">{shop.name}</h2>
              <div className="shop-meta">
                <div><strong>Owner:</strong> {shop.owner_name || "--"}</div>
                <div><strong>Contact:</strong> {shop.contact_number || "--"}</div>
                <div><strong>Email:</strong> {shop.email || "--"}</div>
              </div>
            </div>
            <div className="shop-actions">
              <div className="small">Created: {formatDate(new Date(shop.created_at))}</div>
              <div className="address">{shop.address}</div>
            </div>
          </div>
        </section>

        {/* SHOP ATTENDANCE */}
        <section className="card attendance-card">
          <h3>Todays Shop Status</h3>
          <div className="attendance-block">
            <div><strong>Date:</strong> {formatDate(new Date(shopAttendance.date))}</div>
            <div><strong>Opened by:</strong> {shopAttendance.opened_by || "--"}</div>
            <div><strong>Open:</strong> {shopAttendance.open_time ? formatTime(shopAttendance.open_time) : "--:--"}</div>
            <div><strong>Close:</strong> {shopAttendance.close_time ? formatTime(shopAttendance.close_time) : "--:--"}</div>
            <div className="attendance-remarks"><em>{shopAttendance.remarks}</em></div>
          </div>

          <div className="attendance-actions">
            <button className="btn primary" onClick={handleOpenShop}>Open Shop</button>
            <button className="btn danger" onClick={handleCloseShop}>Close Shop</button>
          </div>
        </section>

        {/* STAFF LIST */}
        <section className="card staff-card">
          <h3>Staff ({staff.length})</h3>
          <div className="staff-list">
            {staff.map((s) => (
              <div key={s.id} className="staff-row">
                <div className="staff-left">
                  <div className="staff-name">{s.name} <span className="muted">— {s.position}</span></div>
                  <div className="muted small">Contact: {s.contact_number || "--"}</div>
                </div>

                <div className="staff-att">
                  <div className="att-line"><span className="tiny">Status:</span> <strong>{s.attendance.status}</strong></div>
                  <div className="att-line"><span className="tiny">In:</span> {s.attendance.check_in_time ? formatTime(s.attendance.check_in_time) : "--:--"}</div>
                  <div className="att-line"><span className="tiny">Out:</span> {s.attendance.check_out_time ? formatTime(s.attendance.check_out_time) : "--:--"}</div>
                  <div className="att-line"><span className="tiny">Total:</span> {calcHours(s.attendance.check_in_time, s.attendance.check_out_time, s.attendance.date) || "--"}</div>
                </div>

                <div className="staff-actions">
                  <button className="btn" onClick={() => toggleStaffPresent(s.id)}>
                    {s.attendance.status === "Present" ? "Mark Absent" : "Mark Present"}
                  </button>
                  <button className="btn" onClick={() => addCheckOut(s.id)} disabled={s.attendance.status !== "Present"}>
                    Check-out
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="staff-footer">
            <button className="btn" onClick={() => setShowAddAttendance(true)}>+ Add Attendance</button>
          </div>
        </section>
      </main>

      {/* ---------- Simple Modals / Panels ---------- */}
      {showAddStaff && (
        <div className="modal">
          <div className="modal-card">
            <h3>Add Staff</h3>
            <form onSubmit={handleAddStaff} className="modal-form">
              <label>
                Name
                <input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} />
              </label>
              <div className="modal-actions">
                <button className="btn" type="button" onClick={() => setShowAddStaff(false)}>Cancel</button>
                <button className="btn primary" type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditShop && (
        <div className="modal">
          <div className="modal-card">
            <h3>Edit Shop</h3>
            <form onSubmit={handleUpdateShop} className="modal-form">
              <label>
                Name
                <input defaultValue={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
              </label>
              <label>
                Owner
                <input defaultValue={shop.owner_name} onChange={(e) => setShop({ ...shop, owner_name: e.target.value })} />
              </label>
              <label>
                Contact
                <input defaultValue={shop.contact_number} onChange={(e) => setShop({ ...shop, contact_number: e.target.value })} />
              </label>
              <label>
                Address
                <textarea defaultValue={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} />
              </label>

              <div className="modal-actions">
                <button className="btn" type="button" onClick={() => setShowEditShop(false)}>Cancel</button>
                <button className="btn primary" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddAttendance && (
        <div className="modal">
          <div className="modal-card">
            <h3>Add Attendance</h3>
            <form onSubmit={handleAddAttendance} className="modal-form">
              <label>
                Staff
                <select value={attendanceStaffId || ""} onChange={(e) => setAttendanceStaffId(e.target.value)}>
                  <option value="">-- select staff --</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <div className="modal-actions">
                <button className="btn" type="button" onClick={() => setShowAddAttendance(false)}>Cancel</button>
                <button className="btn primary" type="submit">Mark Present</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}