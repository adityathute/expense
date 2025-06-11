// layout.js
// "use client";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components/components.css";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "Shivanya Multiservices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <TopBar />
          <div className="layout-body">
            <Sidebar />
            <main className="layout-main">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
