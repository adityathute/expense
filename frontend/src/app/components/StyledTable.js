// components/StyledTable.js

"use client";

import ActionButtons from "../components/ActionButtons";
import "../styles/components/table.css";

export default function StyledTable({
  headers = [],
  columns = [],
  data = [],
  emptyText = "No entries found.",
  onEdit,
  onDelete,
  renderCell,
}) {
  return (
    <table className="table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
          {(onEdit || onDelete) && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length ? (
          data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col, i) => (
                <td key={i} data-label={headers[i]} className={col === "name" ? "service-name-cell" : ""}>
                  {renderCell ? renderCell(row, col) : row[col] ?? "-"}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td data-label="Actions">
                  <div className="table-actions">
                    <ActionButtons row={row} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>

              )}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={headers.length + (onEdit || onDelete ? 1 : 0)}
              className="table-empty-cell"
            >
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
