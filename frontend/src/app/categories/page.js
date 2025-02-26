"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [coreCategories, setCoreCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", core_category: "", parent: null });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/categories/");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();

      setCategories(data.categories);
      setCoreCategories(data.core_categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function handleAddCategory() {
    if (!newCategory.name) return alert("Category name is required!");

    try {
      const response = await fetch("http://127.0.0.1:8001/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          core_category: newCategory.core_category || null,
          parent: newCategory.parent !== "" ? newCategory.parent : null,
        }),
      });

      if (!response.ok) {
        console.error("Failed to add category");
        return;
      }

      fetchCategories();
      setNewCategory({ name: "", description: "", core_category: "", parent: null });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  }

  function handleEditCategory(category) {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      core_category: category.core_category,
      parent: category.parent || null,
    });
  }

  async function handleUpdateCategory() {
    if (!editingCategory) return;

    try {
      const response = await fetch(`http://127.0.0.1:8001/api/categories/${editingCategory.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        console.error("Failed to update category");
        return;
      }

      fetchCategories();
      setEditingCategory(null);
      setNewCategory({ name: "", description: "", core_category: "", parent: null });
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

  function renderCategories(categories, parentId = null) {
    return (
      <ul className="category-list">
        {categories.filter((cat) => cat.parent === parentId).map((category) => (
          <li key={category.id} className="category-item">
            <div className="category-details">
              <strong>{category.name}</strong> - {category.description}
              <br />
              <em>Core Category: {category.core_category || "N/A"}</em>
            </div>
            <div className="category-actions">
              <button onClick={() => handleEditCategory(category)}>Edit</button>
              <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
            </div>
            {renderCategories(categories, category.id)}
          </li>
        ))}
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
          <div className="form-container">
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
              value={newCategory.parent || ""}
              onChange={(e) => {
                const parentId = e.target.value;
                const selectedParent = categories.find((cat) => cat.id.toString() === parentId);
                setNewCategory({
                  ...newCategory,
                  parent: parentId || null,
                  core_category: selectedParent ? selectedParent.core_category : "",
                });
              }}
            >
              <option value="">Select Parent Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {!newCategory.parent && (
              <select
                value={newCategory.core_category}
                onChange={(e) => setNewCategory({ ...newCategory, core_category: e.target.value })}
              >
                <option value="">Select Core Category</option>
                {coreCategories.map((core) => (
                  <option key={core} value={core}>{core}</option>
                ))}
              </select>
            )}
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
