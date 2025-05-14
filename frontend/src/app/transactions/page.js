"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import "./transactions.css";
import SearchBar from "../components/SearchBar";  // relative path
import StyledTable from "../components/StyledTable";  // relative path
import Pagination from "../components/Pagination";  // relative path

export default function UidTransactions() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10; // Number of entries per page

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/");
      if (response.ok) {
        const data = await response.json();
        // Sort entries by created_at in descending order
        const sortedEntries = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setEntries(sortedEntries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry =>
    entry.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.mobile_number.includes(searchQuery) ||
    entry.aadhaar_number.includes(searchQuery)
  );

  // Paginate the entries
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle pagination change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination buttons
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredEntries.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="content">
      <TopBar />
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <h1>Transactions</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search by Name, Mobile, Aadhaar" />
              <StyledTable
                headers={["ID", "Name", "Mobile", "Aadhaar", "Entry Type", "UID Type", "Update Type", "Charge"]}
                rows={currentEntries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.full_name}</td>
                    <td>{entry.mobile_number}</td>
                    <td>{entry.aadhaar_number}</td>
                    <td>{entry.entry_type}</td>
                    <td>{entry.uid_type}</td>
                    <td>{entry.update_type}</td>
                    <td>{entry.service_charge}</td>
                  </tr>
                ))}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredEntries.length / entriesPerPage)}
                onPageChange={paginate}
              />

            </>
          )}
        </div>
      </div>
    </div>
  );
}
