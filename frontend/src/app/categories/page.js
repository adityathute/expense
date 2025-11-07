"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import Modal from "../components/Modal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import styles from "../styles/components/modalForm.module.css";
import Pagination from "../components/Pagination";
import { EditIcon, DeleteIcon } from "../components/Icons";
import { ListTree} from "lucide-react";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";

/**
 * Categories page:
 * - shows CORE_CATEGORIES (from backend) as top-level rows (non-editable)
 * - shows DB categories (hierarchical under the cores)
 * - modal uses a single hierarchical picker (core -> sub -> ...)
 */

export default function Categories() {
  // UI state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]); // flat DB categories (excluding core rows)
  const [coreCategories, setCoreCategories] = useState([]); // array of strings from backend
  const [categoryType, setCategoryType] = useState(false); // false = Shop, true = Personal
  const [loading, setLoading] = useState(false);

  // search / pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // form state for add/edit
  const [editingCategory, setEditingCategory] = useState(null); // DB category object when editing
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    // selectedNode holds either "core-<NAME>" for core selection or "<id>" (string) for DB node selection
    selectedNode: "",
  });

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories & core categories
  useEffect(() => {
    fetchCategories();
  }, [categoryType]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();

      // all DB categories (including is_core true/false)
      const allCategories = Array.isArray(data.results) ? data.results : [];
      setCategories(allCategories);

      // top-level pseudo cores for modal
      setCoreCategories(["Income", "Expense"]);
    } catch (err) {
      console.error(err);
      setCategories([]);
      setCoreCategories([]);
    } finally {
      setLoading(false);
    }
  }

  // Build a tree grouped by core (core nodes are pseudo nodes 'core-<NAME>')
  const buildCoreTree = () => {
    const buildSubtree = (core, parentId = null) => {
      return categories
        .filter(c => !c.is_core && c.core_category === core && (c.parent === parentId || (c.parent === null && parentId === null)))
        .map(c => ({ ...c, children: buildSubtree(core, c.id) }));
    };

    return coreCategories.map(coreName => ({
      id: `core-${coreName}`,
      name: coreName,
      isCore: true,
      children: buildSubtree(coreName, null),
    }));
  };

  // Flatten tree for table view (ignore pseudo core nodes)
  const flattenCategoriesForTable = () => {
    const rows = [];

    const buildPath = (node) => {
      let path = [];
      let current = node;
      while (current?.parent) {
        const parent = categories.find(c => c.id === current.parent);
        if (!parent) break;
        path.unshift(parent.name);
        current = parent;
      }
      return path.length > 0 ? `${node.core_category} > ${path.join(" > ")}` : `${node.core_category}`;
    };

    const pushNode = (node) => {
      rows.push({
        _isCore: false,
        id: node.id,
        name: node.name,
        description: node.description || "-",
        core_category: node.core_category || "-",
        parentPath: buildPath(node),
        raw: node,
      });

      // recursively add children
      const children = categories.filter(c => c.parent === node.id);
      for (const child of children) {
        pushNode(child);
      }
    };

    // top-level nodes (parent = null)
    const topLevel = categories.filter(c => !c.parent);
    topLevel.forEach(cat => pushNode(cat));

    return rows;
  };

  // Filter & paginate rows
  // Table rows: flatten only non-core DB categories
  const allRows = flattenCategoriesForTable().filter(row => row.raw.is_core === false);
  const filteredRows = allRows.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.parentPath && r.parentPath.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredRows.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + entriesPerPage);

  // Utility: find parent path for a DB category (used elsewhere)
  function getParentPathFlat(cat) {
    // cat is a DB category object with .parent = id|null
    const path = [];
    let current = cat;
    while (current?.parent) {
      const parent = categories.find((c) => c.id === current.parent);
      if (!parent) break;
      path.unshift(parent.name);
      current = parent;
    }
    return path.length > 0 ? `${cat.core_category} > ${path.join(" > ")}` : `${cat.core_category}`;
  }

  // Render hierarchical options for the modal picker
  const renderOptions = (nodes, level = 0) =>
    nodes.flatMap((node) => {
      if (node.isCore) {
        const coreOption = (
          <option key={node.id} value={node.id} style={{ fontWeight: 700 }}>
            {node.name}
          </option>
        );
        const childOptions = (node.children || []).flatMap(c => renderCategoryOptions(c, 1));
        return [coreOption, ...childOptions];
      }
      return []; // DB categories handled recursively
    });

  const renderCategoryOptions = (node, level = 0) => {
    const prefix = "—".repeat(level);
    const option = (
      <option key={node.id} value={String(node.id)}>
        {prefix} {node.name}
      </option>
    );
    const children = (node.children || []).flatMap(c => renderCategoryOptions(c, level + 1));
    return [option, ...children];
  };

  // Modal handlers
  function openAddModal() {
    setEditingCategory(null);
    setNewCategory({ name: "", description: "", selectedNode: "" });
    setShowCategoryModal(true);
  }

  function handleEditCategory(category) {
    // editing category (DB row) — we need to preselect the node in tree
    // compute the selectedNode value as the category's id (string)
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || "",
      selectedNode: String(category.id),
    });
    setShowCategoryModal(true);
  }

  async function submitAddCategory() {
    if (!newCategory.name?.trim()) return alert("Category name required");
    if (!newCategory.selectedNode) return alert("Please select a place in hierarchy (core or parent category)");

    let parent = null;
    let core_category = "";

    if (newCategory.selectedNode.startsWith("core-")) {
      // Top-level category under a core
      core_category = newCategory.selectedNode.replace("core-", "");
      parent = null;
    } else {
      // Subcategory: send parent id directly
      parent = parseInt(newCategory.selectedNode, 10);

      // Traverse up to find the top-level core category
      let parentNode = categories.find(c => c.id === parent);
      while (parentNode?.parent) {
        parentNode = categories.find(c => c.id === parentNode.parent);
      }
      core_category = parentNode ? parentNode.core_category : "";
    }

    try {
      const res = await fetch("http://127.0.0.1:8001/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || "",
          core_category,
          parent,
          category_type: categoryType,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add");
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add category");
    }
  }

  async function submitUpdateCategory() {
    if (!editingCategory) return;
    if (!newCategory.name?.trim()) return alert("Category name required");

    // For updating, allow changing name/description only. Parent/core remain as-is to avoid complexity.
    // If you want to allow moving nodes, we can expand this.
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/categories/${editingCategory.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || "",
          // only partial update fields; keep existing parent/core if omitted
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update");
      }
      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update category");
    }
  }

  function closeModal() {
    setEditingCategory(null);
    setShowCategoryModal(false);
    setNewCategory({ name: "", description: "", selectedNode: "" });
  }

  async function handleDeleteCategory(id) {
    if (!id) return;
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/categories/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Delete failed");
      }
      await fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete category");
    }
  }

  return (
    <div className="content">
      <HeaderWithNewButton
        title={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ListTree size={22} color="#ffb347" />
            <span>Categories</span>
          </span>
        }
      />
      
      <div className="main-switch-header">
        <div className="switch-container">
          <label className="switch">
            <input
              type="checkbox"
              checked={categoryType}
              onChange={() => {
                setCategoryType(!categoryType);
                setCurrentPage(1);
              }}
            />
            <span className="slider"></span>
          </label>
          <span className="switch-text">{categoryType ? "Personal" : "Shop"}</span>
        </div>

        <button className="create-btn" onClick={openAddModal}>
          + Create Category
        </button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="Search categories..."
      />

      {/* Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <div className={styles.modalFormGroup}>
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className={styles.modalFormInput}
          />
          <input
            type="text"
            placeholder="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            className={styles.modalFormTextarea}
            style={{ marginBottom: "0.9rem" }}
          />

          {/* Unified hierarchical selector */}
          <label>Place in hierarchy (pick a core or a parent category)</label>
          <select
            className={styles.modalFormInput}
            value={newCategory.selectedNode}
            onChange={(e) => setNewCategory({ ...newCategory, selectedNode: e.target.value })}
          >
            <option value="">--Select (Core or Parent Category)--</option>
            {renderOptions(buildCoreTree())}
          </select>

          <div className="modal-actions" style={{ marginTop: "0.8rem" }}>
            <button
              className={styles.buttonSubmit}
              onClick={(ev) => {
                ev.preventDefault();
                editingCategory ? submitUpdateCategory() : submitAddCategory();
              }}
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => handleDeleteCategory(categoryToDelete)}
        categoryId={categoryToDelete}
        categoryName={categories.find((cat) => cat.id === categoryToDelete)?.name}
      />

      {/* Table */}
      {paginatedRows.length > 0 ? (
        <div className="category-table-container">
          <StyledTable
            headers={["Name", "Description", "Core Category", "Parent Path", "Actions"]}
            columns={["name", "description", "core_category", "parentPath", "actions"]}
            data={paginatedRows.map((row) => ({
              ...row,
              // actions object for StyledTable to provide edit/delete callbacks
              actions: row._isCore
                ? { editable: false, deletable: false }
                : { editable: true, deletable: true, id: row.id },
            }))}
            renderCell={(row, col) => {
              if (col === "name") {
                return row._isCore ? <strong>{row.name}</strong> : row.name;
              }
              if (col === "parentPath") {
                return row.parentPath || "-";
              }
              if (col === "actions") {
                if (row._isCore) return "-";

                return (
                  <div className="action-buttons">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => {
                        const dbCat = categories.find((c) => c.id === row.id);
                        if (dbCat) handleEditCategory(dbCat);
                      }}
                    >
                      <EditIcon />
                    </button>

                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => {
                        setCategoryToDelete(row.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                );
              }
              return row[col] ?? "-";
            }}
          />

          {filteredRows.length > entriesPerPage && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No categories found.
        </div>
      )}
    </div>
  );
}
