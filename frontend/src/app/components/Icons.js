// components/Icon.js
// import "./../styles/icons.css";

export function EditIcon({ className = "icon" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM21.41 6.34a1.25 1.25 0 000-1.77l-2.34-2.34a1.25 1.25 0 00-1.77 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

export function DeleteIcon({ className = "icon" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M3 6h18v2H3V6zm2 3h14v13H5V9zm2 2v9h10v-9H7zm4-6h2v2h-2V5zm-1 2h4v2h-4V7z" />
    </svg>
  );
}
