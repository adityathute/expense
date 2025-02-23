"use client";
import Link from "next/link";

export default function CategoriesPage() {
  return (
    <div className="homepage">
      <div className="container">
        <h1 className="title">Categories</h1>
        <p className="description">Manage your categories here.</p>

        <div className="button-group">
          <Link href="/">
            <button className="btn btn-blue">Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
