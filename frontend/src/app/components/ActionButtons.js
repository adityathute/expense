import { EditIcon, DeleteIcon } from "../components/icons";
import "./../styles/actionbuttons.css";

export default function ActionButtons({ row, onEdit, onDelete }) {
  return (
    <div className="action-buttons">
      {onEdit && (
        <button
          type="button"
          className="action-btn action-btn--edit"
          onClick={() => onEdit(row)}
          aria-label={`Edit ${row.name || ""}`}
        >
          <EditIcon />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="action-btn action-btn--delete"
          onClick={() => onDelete(row)}
          aria-label={`Delete ${row.name || ""}`}
        >
          <DeleteIcon />
        </button>
      )}
    </div>
  );
}
