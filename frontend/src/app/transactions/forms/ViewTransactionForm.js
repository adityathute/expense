"use client";

export default function ViewTransactionForm({ data, getName, onEdit, onDelete, onClose }) {
    if (!data) return null;

    const isService = data.transaction_type === "Service";

    // Use backend-provided names if available
    const name = isService
        ? data.service_name || getName(data.service, "Service")
        : data.category_name || getName(data.category, "Finance");

    return (
        <div>
            <div>
                {data.global_id && <p><strong>Transaction ID:</strong> {data.global_id}</p>}
                {data.transaction_type && <p><strong>Type:</strong> {data.transaction_type}</p>}
                {data.user?.username && <p><strong>User:</strong> {data.user.username}</p>}
                <p><strong>{isService ? "Service Name" : "Category Name"}:</strong> {name}</p>
                {/* Show both amounts */}
                {data.amount && <p><strong>Transaction Amount:</strong> ₹{data.amount}</p>}
                {isService && data.service_fee && (
                    <p><strong>Service Fee:</strong> ₹{data.service_fee}</p>
                )}
                {data.date_created && (
                    <p><strong>Date:</strong> {new Date(data.date_created).toLocaleDateString("en-GB")}</p>
                )}
            </div>

            <div className="service-details-actions" style={{ marginTop: "1rem" }}>
                <button className="service-edit-btn" onClick={() => onEdit()}>
                    ✎ Edit Service
                </button>

                <button
                    className="service-delete-btn"
                    onClick={() => onDelete(data)}
                    style={{ marginLeft: "10px" }}
                >
                    🗑 Delete
                </button>
            </div>
        </div>
    );
}
