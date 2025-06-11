// components/SearchBar.js
// import "./../styles/search.css";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
