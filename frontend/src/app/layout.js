// layout.js

import "./styles.css";

export const metadata = {
  title: "Shivanya Multiservices",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
