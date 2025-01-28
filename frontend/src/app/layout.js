// layout.js

import "./styles.css"; // Import the global CSS file

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
