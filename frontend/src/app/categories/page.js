"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./categories.css";
import SearchBar from "../components/SearchBar"; // ✅ Add this line

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

  async function fetchCategories() {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
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
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
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
          {showCategoryModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>

                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
                  <button className="add-btn" onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                    {editingCategory ? "Update Category" : "Add Category"}
                  </button>
                  <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {message && <div className="message">{message}</div>}

          {loading ? <p>Loading categories...</p> : (

            <div className="category-table-container">
              <table className="category-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Core Category</th>
                    <th>Hierarchy Path</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => {
                    const parentPath = getParentPath(categories, category);
                    return (
                      <tr key={category.id}>
                        <td className="">{category.name}</td>
                        <td>{category.description || "-"}</td>
                        <td>{category.core_category}</td>
                        <td>{parentPath.replace("Category: ", "")}</td>
                        <td>
                          <div className="category-actions">
                            <button
                              type="button"
                              className="edit-btn"
                              onClick={() => handleEditCategory(category)}
                            >
                              <svg
                                className="edit-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1.25 1.25 0 000-1.77l-2.34-2.34a1.25 1.25 0 00-1.77 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => {
                                setCategoryToDelete(category.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <svg
                                className="trash-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm2 2v9h10v-9H7zm4-6h2v2h-2V5zm-1 2h4v2h-4V7z" />
                              </svg>
                            </button>
                            {showDeleteModal && (
                              <div className="modal-overlay">
                                <div className="modal-content">
                                  <h2>Confirm Deletion</h2>
                                  <p>Are you sure you want to delete this category? This action cannot be undone.</p>
                                  <div className="modal-actions">
                                    <button className="add-btn" onClick={handleDeleteCategory}>Yes, Delete</button>
                                    <button
                                      className="cancel-btn"
                                      onClick={() => {
                                        setShowDeleteModal(false);
                                        setCategoryToDelete(null);
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
