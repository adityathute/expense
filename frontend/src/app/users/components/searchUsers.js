"use client";

import { useState } from "react";

export default function SearchUsers({ users, onSearchResults }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filteredUsers = users.filter((user) => {
      const lowerCaseQuery = query.toLowerCase();

      return (
        (user.name?.toLowerCase().includes(lowerCaseQuery) || false) ||
        (user.mobile_number?.includes(lowerCaseQuery) || false) ||
        (user.identifications?.some((id) => id.id_number?.includes(lowerCaseQuery)) || false)
      );
    });

    onSearchResults(filteredUsers);
  };

  return (
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={handleSearchChange}
      />
  );
}
