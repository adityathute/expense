"use client";

export default function ViewTransactionForm({ data, onEdit, onDelete, onClose }) {
    return (
        <div>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Amount:</strong> ₹{data.amount}</p>
            <p><strong>Date:</strong> {data.date}</p>

            {/* === Actions === */}
            <div className="service-details-actions" style={{ marginTop: "1rem" }}>
                <button
                    className="service-edit-btn"
                    onClick={() => {
                        onEdit();
                    }}
                >
                    ✎ Edit Service
                </button>

                <button
                    className="service-delete-btn"
                    onClick={() => {
                        onDelete(data);
                    }}
                    style={{ marginLeft: "10px" }}
                >
                    🗑 Delete
                </button>
            </div>
        </div>
    );
}
