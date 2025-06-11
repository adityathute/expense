"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchBar from "../components/SearchBar";
import StyledTable from "../components/StyledTable";
import Pagination from "../components/Pagination";
import BalanceCell from "../components/BalanceCell";
// import "./transactions.css";

export default function UidTransactions() {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8001/api/uid-entries/");
      if (response.ok) {
        const data = await response.json();
        const sortedEntries = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setEntries(sortedEntries);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering based on search query
  const filteredEntries = entries.filter(
    (entry) =>
      entry.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.mobile_number.includes(searchQuery) ||
      entry.aadhaar_number.includes(searchQuery)
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset page on search
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const headers = ["ID", "Name", "Mobile", "Aadhaar", "Entry Type", "UID Type", "Update Type", "Charge"];
  const columns = ["id", "full_name", "mobile_number", "aadhaar_number", "entry_type", "uid_type", "update_type", "service_charge"];

  // Custom renderCell function for BalanceCell in the "service_charge" column
  function renderCell(row, column) {
    if (column === "service_charge") {
      return <BalanceCell value={row.service_charge} />;
    }
    return row[column] ?? "-";
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
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by Name, Mobile, Aadhaar"
              />
              <StyledTable
                headers={headers}
                columns={columns}
                data={currentEntries}
                renderCell={renderCell}
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
