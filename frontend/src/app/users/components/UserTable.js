import React from "react";

export default function UserTable({ users, onSelectUser }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Mobile</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              <span className="user-link" onClick={() => onSelectUser(user)}>
                {user.name}
              </span>
            </td>
            <td>{user.mobile_number}</td>
            <td>
              {user.identifications.length > 0
                ? user.identifications.map(id => `${id.id_type}: ${id.id_number}`).join(", ")
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
  