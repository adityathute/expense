import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components/components.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Shivanya Multiservices",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicons/icon-192.png",
  },
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
