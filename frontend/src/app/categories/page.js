// categories/page.js
"use client";
import { useEffect, useState, useRef } from "react";
import SearchBar from "../components/SearchBar"; // ✅ Add this line
import StyledTable from "../components/StyledTable"; // adjust the path if needed
import Modal from "../components/Modal";
import DeleteCategoryModal from "./DeleteCategoryModal";

export default function Categories() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryType, setCategoryType] = useState("Shop");
  const [coreCategories, setCoreCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    core_category: "",
    parent: null,
    hierarchy: [],
  });

  const [editingCategory, setEditingCategory] = useState(null);

  // For Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);
  console.log("Fetching categories for type:", categoryType);

  async function fetchCategories() {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
      console.log("Response status:", response.status);

      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
      setCoreCategories(data.core_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategory.core_category) return alert("Please select a Core Category!");
    if (!newCategory.name.trim()) return alert("Category name is required!");

    const parentCategory =
      newCategory.hierarchy.length > 0
        ? newCategory.hierarchy[newCategory.hierarchy.length - 1]
        : null;

    try {
      const response = await fetch("http://127.0.0.1:8001/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description || "",
          core_category: newCategory.core_category,
          parent: parentCategory,
          category_type: categoryType,
        }),
      });

      if (!response.ok) throw new Error("Failed to add category");

      fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  }

  function handleEditCategory(category) {
    let hierarchyPath = [];
    let parent = category.parent;

    while (parent) {
      hierarchyPath.unshift(parent);
      parent = categories.find((cat) => cat.id === parent)?.parent;
    }

    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      core_category: category.core_category,
      parent: category.parent || null,
      hierarchy: hierarchyPath,
    });

    setShowCategoryModal(true);
  }

  async function handleUpdateCategory() {
    if (!editingCategory) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/categories/${editingCategory.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error("Failed to update category");

      fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  }

  async function handleDeleteCategory() {
    try {
      await fetch(`http://127.0.0.1:8001/api/categories/${categoryToDelete}/`, { method: "DELETE" });
      fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setMessage("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      setMessage("Failed to delete category.");
    }
  }

  function closeModal() {
    setEditingCategory(null);
    setShowCategoryModal(false);
    setNewCategory({ name: "", description: "", core_category: "", parent: null, hierarchy: [] });
  }

  function getParentPath(categories, category) {
    let path = [];
    let coreCategory = category.core_category || "N/A";

    while (category?.parent) {
      category = categories.find((cat) => cat.id === category.parent);
      if (category) path.unshift(category.name);
    }

    return path.length > 0
      ? `Category: ${coreCategory} > ${path.join(" > ")}`
      : `Category: ${coreCategory}`;
  }

  return (
    <div className="content">
      <h1>Categories</h1>

      {/* Switch Container */}
      <div className="main-switch-header">
        <div className="switch-container">
          <label className="switch">
            <input
              type="checkbox"
              checked={categoryType === "Shop"}
              onChange={() => {
                if (!loading) setCategoryType(categoryType === "Home" ? "Shop" : "Home");
              }}
            />
            <span className="slider"></span>
          </label>

          <span className="switch-text">{categoryType}</span>
        </div>

        {/* Add Button */}
        <button className="create-btn" onClick={() => setShowCategoryModal(true)}>
          + Create Category
        </button>
      </div>
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search categories..."
      />

      {/* Modal for Category Form */}
      <Modal
        isOpen={showCategoryModal}
        onClose={closeModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="modal-input"
          />
          <input
            type="text"
            placeholder="Description"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            className="modal-input"
          />

          <select
            value={newCategory.core_category || ""}
            onChange={(e) => {
              setNewCategory({
                ...newCategory,
                core_category: e.target.value,
                parent: null,
                hierarchy: [],
              });
            }}
            className="modal-select"
          >
            <option value="">Select Core Category</option>
            {coreCategories.map((core) => (
              <option key={core} value={core}>
                {core}
              </option>
            ))}
          </select>

          {newCategory.core_category &&
            categories.some((cat) => cat.core_category === newCategory.core_category && !cat.parent) && (
              <select
                value={newCategory.hierarchy[0] || ""}
                onChange={(e) => {
                  const selectedCategoryId = e.target.value;
                  setNewCategory({
                    ...newCategory,
                    parent: selectedCategoryId || null,
                    hierarchy: selectedCategoryId ? [selectedCategoryId] : [],
                  });
                }}
                className="modal-select"
              >
                <option value="">Select Main Category</option>
                {categories
                  .filter((cat) => cat.core_category === newCategory.core_category && !cat.parent)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            )}

          {newCategory.hierarchy.map((parentId, index) => {
            const subcategories = categories.filter((cat) => cat.parent == parentId);
            if (subcategories.length === 0) return null;

            return (
              <select
                key={index}
                value={newCategory.hierarchy[index + 1] || ""}
                onChange={(e) => {
                  const selectedSubcategoryId = e.target.value;
                  let newHierarchy = [...newCategory.hierarchy.slice(0, index + 1)];

                  if (selectedSubcategoryId) newHierarchy.push(selectedSubcategoryId);

                  setNewCategory({
                    ...newCategory,
                    parent: selectedSubcategoryId || null,
                    hierarchy: newHierarchy,
                  });
                }}
                className="modal-select"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            );
          })}

          <div className="modal-actions">
            <button
              className="modal-save-btn"
              onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
            >
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
            <button className="modal-cancel-btn" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      </Modal>

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteCategory}
        category={categories.find((cat) => cat.id === categoryToDelete)}
      />
      {filteredCategories.length > 0 ? (
        <div className="category-table-container">
          <StyledTable
            headers={["Name", "Description", "Core Category", "Parent"]}
            columns={["name", "description", "core_category", "parentPath"]}
            data={filteredCategories.map(cat => ({
              ...cat,
              parentPath: getParentPath(categories, cat).replace("Category: ", ""),
              description: cat.description || "-"
            }))}
            onEdit={handleEditCategory}
            onDelete={(cat) => {
              setShowDeleteModal(true);
              setCategoryToDelete(cat.id);
            }}
          />
        </div>
      ) : (
        <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
          No categories found.
        </div>
      )}


    </div>
  );
}
