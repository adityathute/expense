"use client";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Dashboard() {
  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Welcome to the Reports</h1>
          <p>Manage your transactions, categories, and more. </p>
        </div>
      </div>
    </div>
  );
}
