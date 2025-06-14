// app/page.js
"use client";
import "./landing.css";

export default function Home() {
  return (
    <div className="shivanya-landing">
      <div className="shivanya-hero">
        <h1 className="shivanya-title">Welcome to Shivanya Multiservices</h1>
        <p className="shivanya-subtitle">
          Track your income, expenses, services, and balance with ease.
        </p>
        <a href="#get-started" className="shivanya-btn">Get Started</a>
      </div>

      <div className="shivanya-features">
        <h2 className="shivanya-section-title">What We Offer</h2>
        <div className="shivanya-grid">
          <div className="shivanya-card">
            <h3>Income Tracking</h3>
            <p>Real-time insights and tracking for all your income sources.</p>
          </div>
          <div className="shivanya-card">
            <h3>Expense Management</h3>
            <p>Control your spending with detailed expense breakdowns.</p>
          </div>
          <div className="shivanya-card">
            <h3>Smart Dashboard</h3>
            <p>Minimal, clear dashboard for financial clarity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

