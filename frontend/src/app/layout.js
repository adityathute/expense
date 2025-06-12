// app/layout.js
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components/components.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Shivanya Multiservices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
