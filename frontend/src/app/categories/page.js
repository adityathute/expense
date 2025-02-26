"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryType, setCategoryType] = useState("Shop"); // Default to Home
  const [coreCategories, setCoreCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    core_category: "",
    parent: null,
    hierarchy: [], // ✅ Ensure it's always an array
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const formRef = useRef(null); // ✅ Reference for scrolling to form

  useEffect(() => {
    fetchCategories();
  }, [categoryType]);


  async function fetchCategories() {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
      setCoreCategories(data.core_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
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
          category_type: categoryType,  // ✅ Ensure this is sent!
        }),
      });

      if (!response.ok) throw new Error("Failed to add category");

      fetchCategories();
      setNewCategory({
        name: "",
        description: "",
        core_category: "",
        parent: null,
        hierarchy: [],
      });
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

    // ✅ Scroll smoothly to the form when editing starts
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
      setEditingCategory(null);
      setNewCategory({ name: "", description: "", core_category: "", parent: null, hierarchy: [] });
    } catch (error) {
      console.error("Error updating category:", error);
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await fetch(`http://127.0.0.1:8001/api/categories/${id}/`, { method: "DELETE" });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
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

  function renderCategories(categories, parentId = null) {
    return (
      <ul className="category-list">
        {categories.filter((cat) => cat.parent === parentId).map((category) => {
          const parentPath = getParentPath(categories, category);

          return (
            <li key={category.id} className="category-item">
              <div className="category-details">
                <strong>{category.name}</strong>
                {category.description && ` - ${category.description}`}
                <br />
                <em>{parentPath}</em>
              </div>
              <div className="category-actions">
                <div className="category-actions">
                  <button className="edit-btn" onClick={() => handleEditCategory(category)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.002 1.002 0 000-1.42l-2.34-2.34a1.002 1.002 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"></path>
                    </svg>
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="red"
                    >
                      <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm4 2v8h2v-8H9zm4 0v8h2v-8h-2zM9 3h6v2H9V3z"></path>
                    </svg>
                  </button>
                </div>

              </div>
              {renderCategories(categories, category.id)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Categories</h1>
          <div className="switch-container">
            <div className="switch-container">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={categoryType === "Shop"}
                  onChange={() => {
                    const newType = categoryType === "Home" ? "Shop" : "Home";
                    setCategoryType(newType);
                  }}
                />
                <span className="slider"></span>
              </label>
              <span className="switch-text">{categoryType}</span> {/* Text with margin-left */}
            </div>
          </div>
          <div className="form-container" ref={formRef}>
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

            {/* Core Category Dropdown */}
            <select
              value={newCategory.core_category || ""}
              onChange={(e) => {
                setNewCategory({
                  ...newCategory,
                  core_category: e.target.value,
                  parent: null,
                  hierarchy: [], // Reset hierarchy when core category changes
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

            {/* First Dropdown: Main Categories under the selected Core Category */}
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

            {/* Dynamically Generate Subcategory Dropdowns */}
            {newCategory.hierarchy.map((parentId, index) => {
              const subcategories = categories.filter((cat) => cat.parent == parentId);

              if (subcategories.length === 0) return null; // Hide dropdown if no subcategories available

              return (
                <select
                  key={index}
                  value={newCategory.hierarchy[index + 1] || ""}
                  onChange={(e) => {
                    const selectedSubcategoryId = e.target.value;
                    let newHierarchy = [...newCategory.hierarchy.slice(0, index + 1)];

                    if (selectedSubcategoryId) {
                      newHierarchy.push(selectedSubcategoryId);
                    }

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

            <button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
              {editingCategory ? "Update Category" : "Add Category"}
            </button>
          </div>

          {renderCategories(categories)}
        </div>
      </div>
    </div>
  );
}
