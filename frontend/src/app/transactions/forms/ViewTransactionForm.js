"use client";

export default function ViewTransactionForm({ data, onEdit, onDelete, onClose }) {
    return (
        <div>
            <div>
                <p><strong>Transaction ID:</strong> {data.global_id}</p>
                <p><strong>Type:</strong> {data.transaction_type}</p>
                <p><strong>User:</strong> {data.user?.username || "-"}</p>
                <p><strong>Service / Category:</strong> {data.service_or_category}</p>
                <p><strong>Amount:</strong> ₹{data.amount}</p>
                <p><strong>Date:</strong> {new Date(data.date_created).toLocaleDateString("en-GB")}</p>
            </div>
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
