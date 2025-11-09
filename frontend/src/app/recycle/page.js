"use client";
import { useEffect, useState } from "react";
import StyledTable from "../components/StyledTable";
import { DeleteIcon, RestoreIcon } from "../components/Icons";
import DeleteServiceModal from "../services/DeleteServiceModal";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import styles from "../styles/components/modalForm.module.css";

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
      fetch("http://127.0.0.1:8001/api/accounts/?show_deleted=true").then(res => res.json()),
      fetch("http://127.0.0.1:8001/api/users/?show_deleted=true").then(res => res.json()), // ✅ Users added
    ])
      .then(([servicesData, categoriesData, accountsData, usersData]) => {
        const deletedServices = servicesData.filter(s => s.is_deleted);
        const servicesWithType = deletedServices.map(s => ({
          id: s.id,
          name: s.name,
          type: "Service"
        }));

        const deletedCategories = (categoriesData.results || []).filter(c => c.is_deleted);
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

        const deletedUsers = usersData.filter(u => u.is_deleted);
        const usersWithType = deletedUsers.map(u => ({
          id: u.id,
          name: u.name,
          type: "User"
        }));

        const combinedItems = [
          ...servicesWithType.map(s => ({ ...s, reactKey: `Service-${s.id}` })),
          ...categoriesWithType.map(c => ({ ...c, reactKey: `Category-${c.id}` })),
          ...accountsWithType.map(a => ({ ...a, reactKey: `Account-${a.id}` })),
          ...usersWithType.map(u => ({ ...u, reactKey: `User-${u.id}` })), // ✅ Users added
        ];

        setDeletedItems(combinedItems);
      })
      .catch(err => console.error(err));
  }, []);

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
      else if (type === "Account") url = `http://127.0.0.1:8001/api/accounts/${id}/restore/`;
      else if (type === "User") url = `http://127.0.0.1:8001/api/users/${id}/restore/`; // ✅ Users restore

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
      else if (type === "Account") url = `http://127.0.0.1:8001/api/accounts/${id}/hard-delete/`;
      else if (type === "User") url = `http://127.0.0.1:8001/api/users/${id}/hard-delete/`; // ✅ Users hard delete

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
      <HeaderWithNewButton
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DeleteIcon className={styles.icon} style={{ color: "#7e1710" }} />
            <span>Recycle Bin</span>
          </span>
        }
      />

      <SearchBar
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
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
