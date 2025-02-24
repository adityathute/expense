"use client";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./categories.css"; // Import the CSS file

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
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
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  async function handleAddCategory() {
    if (!newCategory.name) return;
    try {
      const response = await fetch("http://127.0.0.1:8001/api/categories/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        fetchCategories();
        setNewCategory({ name: "", description: "" });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  }

  async function handleEditCategory() {
    if (!editingCategory.name) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/api/categories/${editingCategory.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCategory),
        }
      );
      if (response.ok) {
        fetchCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error editing category:", error);
    }
  }

  async function handleDeleteCategory(id) {
    try {
      await fetch(`http://127.0.0.1:8001/api/categories/${id}/`, {
        method: "DELETE",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  }

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Categories</h1>
          <p>Manage your categories, sub-categories, and more.</p>

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
            <button onClick={handleAddCategory}>Add Category</button>
          </div>

          <ul className="category-list">
            {categories.length > 0 ? (
              categories.map((category) => (
                <li key={category.id}>
                  {editingCategory && editingCategory.id === category.id ? (
                    <div className="edit-container">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        value={editingCategory.description}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, description: e.target.value })
                        }
                      />
                      <button onClick={handleEditCategory}>Save</button>
                    </div>
                  ) : (
                    <div className="category-item">
                      <span>
                        <strong>{category.name}</strong> - {category.description}
                      </span>
                      <button onClick={() => setEditingCategory(category)}>Edit</button>
                      <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <p>Loading categories...</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
