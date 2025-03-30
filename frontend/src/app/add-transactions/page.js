"use client";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Link from "next/link";

export default function AddTransactions() {

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Link href="/uid-service"><button className="btn btn-primary">Aadhaar</button></Link>
        </div>
      </div>
    </div>
  );
}
