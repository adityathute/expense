"use client";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <h1>Welcome to the Dashboard</h1>
        <p>Manage your transactions, categories, and more.</p>
      </div>
    </div>
  );
}
