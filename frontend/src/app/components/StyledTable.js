// components/StyledTable.js
// import "./../styles/table.css";
import ActionButtons from "../components/ActionButtons";
import "../styles/components/table.css";

export default function StyledTable({
  headers = [],
  columns = [],
  data = [],
  emptyText = "No entries found.",
  onEdit,
  onDelete,
  renderCell, // new optional function (row, column) => JSX
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
          data.map((row) => (
            <tr key={row.id || JSON.stringify(row)}>
              {columns.map((col, i) => (
                <td key={i}>
                  {renderCell ? renderCell(row, col) : row[col] ?? "-"}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="table-actions">
                  <ActionButtons row={row} onEdit={onEdit} onDelete={onDelete} />
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length + (onEdit || onDelete ? 1 : 0)}>
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
