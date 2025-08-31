"use client";
import { useEffect, useState } from "react";
import StyledTable from "../components/StyledTable";
import { DeleteIcon, RestoreIcon } from "../components/Icons";
import DeleteServiceModal from "../services/DeleteServiceModal";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar"; // ✅ Import SearchBar

export default function RecycleBinPage() {
  const [deletedItems, setDeletedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState("hard");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8001/api/services/?show_deleted=true").then(res => res.json()),
      fetch("http://127.0.0.1:8001/api/categories/?show_deleted=true").then(res => res.json()),
      fetch("http://127.0.0.1:8001/api/accounts/?show_deleted=true").then(res => res.json()), // ✅ Add accounts
    ])
      .then(([servicesData, categoriesData, accountsData]) => {
        const deletedServices = servicesData.filter(s => s.is_deleted);
        const servicesWithType = deletedServices.map(s => ({
          id: s.id,
          name: s.name,
          type: "Service"
        }));

        const deletedCategories = (categoriesData.categories || []).filter(c => c.is_deleted);
        const categoriesWithType = deletedCategories.map(c => ({
          id: c.id,
          name: c.name,
          type: "Category"
        }));

        const deletedAccounts = accountsData.filter(a => a.is_deleted);
        const accountsWithType = deletedAccounts.map(a => ({
          id: a.id,
          name: a.account_holder_name || a.bank_service_name || `Account ${a.id}`,
          type: "Account"
        }));

        const combinedItems = [
          ...servicesWithType.map(s => ({ ...s, reactKey: `Service-${s.id}` })),
          ...categoriesWithType.map(c => ({ ...c, reactKey: `Category-${c.id}` })),
          ...accountsWithType.map(a => ({ ...a, reactKey: `Account-${a.id}` })), // ✅ Add accounts
        ];

        setDeletedItems(combinedItems);
      })
      .catch(err => console.error(err));
  }, []);


  // Filter deletedItems based on searchTerm
  const filteredItems = deletedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + entriesPerPage);

  const handleRestore = async (id, type) => {
    try {
      let url;
      if (type === "Service") url = `http://127.0.0.1:8001/api/services/${id}/restore/`;
      else if (type === "Category") url = `http://127.0.0.1:8001/api/categories/${id}/restore/`;
      else if (type === "Account") url = `http://127.0.0.1:8001/api/accounts/${id}/restore/`; // ✅ Accounts restore

      const response = await fetch(url, { method: "POST" });
      if (response.ok) {
        setDeletedItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handlePermanentDelete = async (id, type) => {
    try {
      let url;
      if (type === "Service") url = `http://127.0.0.1:8001/api/services/${id}/`;
      else if (type === "Category") url = `http://127.0.0.1:8001/api/categories/${id}/`;
      if (type === "Account") url = `http://127.0.0.1:8001/api/accounts/${id}/hard-delete/`;

      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        setDeletedItems(prev => prev.filter(item => item.id !== id));
        setIsModalOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const openDeleteModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="recycle-bin-page">
      <h1>Recycle Bin</h1>

      <SearchBar
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // reset to first page when searching
        }}
        placeholder="Search deleted items..."
      />

      {paginatedItems.length > 0 ? (
        <>
          <StyledTable
            headers={["Name", "Type", "Actions"]}
            columns={["name", "type", "actions"]}
            data={paginatedItems}
            getRowKey={row => row.reactKey}
            emptyText="Recycle bin is empty."
            renderCell={(row, col) => {
              if (col === "actions") {
                return (
                  <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    <button
                      onClick={() => handleRestore(row.id, row.type)}
                      className="action-btn action-btn--edit"
                      title="Restore"
                    >
                      <RestoreIcon />
                    </button>
                    <button
                      onClick={() => openDeleteModal(row, "hard")}
                      className="action-btn action-btn--delete"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                );
              }
              return row[col] || "-";
            }}
          />

          {filteredItems.length > entriesPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No deleted items found.
        </div>
      )}

      <DeleteServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => handlePermanentDelete(selectedItem.id, selectedItem.type)}
        service={selectedItem}
        type={modalType}
      />
    </div>
  );
}
