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
          <h1>Welcome to the Services</h1>
          <p>Manage your Services like Election card, Pancard, FarmerId Cards Details and much more. </p>
        </div>
      </div>
    </div>
  );
}
