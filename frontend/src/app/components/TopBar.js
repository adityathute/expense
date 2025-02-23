"use client";

export default function TopBar() {
  return (
    <div className="topbarOuter">
      <div className="topbar">
        <div className="leftTopbar">Shivanya Multiservices</div>
        <div className="rightTopbar">
          <button className="btn btn-primary">Add Transaction</button>
          <button className="btn btn-dark">Login</button>
        </div>
      </div>
    </div>
  );
}
