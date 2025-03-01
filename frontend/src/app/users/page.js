"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/users/")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Users & Services</h1>

          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Services Used</th>
                <th>Total Charge</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.address}</td>
                  <td>{user.mobile_number}</td>
                  <td>{user.email}</td>
                  <td>
                    <ul>
                      {user.services_used.map((service) => (
                        <li key={service.id}>
                          {service.service_name} (Ack: {service.acknowledgment_number}, Track: {service.tracking_number}, Amount: {service.amount})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{user.total_charge}</td>
                  <td>{user.paid_charge}</td>
                  <td>{user.remaining_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
