"use client";

import React, { useState, useEffect } from "react";
import { Banknote } from "lucide-react";
import "./style.css";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import StyledTable from "../components/StyledTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import LoanForm from "./LoanForm";
import Pagination from "../components/Pagination";

export default function Loans() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // open & close handlers
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // ─── Fetch accounts from backend
    useEffect(() => {
        async function fetchAccounts() {
            try {
                const res = await fetch("http://127.0.0.1:8001/api/accounts/");
                const data = await res.json();
                const accountsArray = Array.isArray(data) ? data : data.results || [];
                const filtered = accountsArray.filter(
                    (acc) => acc.account_mode === "Cash" || acc.account_mode === "Online"
                );
                setAccounts(filtered);
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            }
        }

        fetchAccounts();
    }, []);

    // ─── Fetch loans from backend
    useEffect(() => {
        async function fetchLoans() {
            try {
                setLoading(true);
                const res = await fetch("http://127.0.0.1:8001/api/loans/");
                const data = await res.json();
                setLoans(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error("Failed to fetch loans:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLoans();
    }, []);

    // ─── Handle add/update loan
    const handleLoanSubmit = (newLoan) => {
        setLoans((prev) => {
            const index = prev.findIndex((l) => l.id === newLoan.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = newLoan;
                return updated;
            }
            return [newLoan, ...prev];
        });
    };

    // ─── Handle delete loan
    const handleLoanDelete = async (loan) => {
        if (!confirm(`Delete loan ${loan.loan_id}?`)) return;

        try {
            const res = await fetch(`http://127.0.0.1:8001/api/loans/${loan.id}/`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            setLoans((prev) => prev.filter((l) => l.id !== loan.id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete loan");
        }
    };

    // ─── Filter loans by search term
    const filteredLoans = loans.filter(
        (loan) =>
            loan.loan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.party_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Pagination calculations
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
    const paginatedLoans = filteredLoans.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const headers = [
        "Party Name",
        "Disbursed",
        "Principal",
        "Interest Rate",
        "EMI",
        "Total Payable",
        "Remaining Amount",
        "Status",
    ];

    const columns = [
        "party_name",
        "disbursed_amount",
        "principal_amount",
        "interest_rate",
        "emi_amount",
        "total_payable",
        "remaining_amount",
        "is_active",
    ];

    return (
        <div className="loans-page">
            <HeaderWithNewButton
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Banknote size={22} color="#ffb347" />
                        <span>Loans</span>
                    </span>
                }
                buttonLabel="Add Loan"
                onClick={handleOpenModal}
            />

            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search loans..."
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Loan">
                <LoanForm onClose={handleCloseModal} accounts={accounts} onSubmit={handleLoanSubmit} />
            </Modal>

            <div style={{ marginTop: "1.5rem" }}>
                {loading ? (
                    <p>Loading loans...</p>
                ) : filteredLoans.length > 0 ? (
                    <>
                        <StyledTable
                            headers={headers}
                            columns={columns}
                            data={paginatedLoans}
                            getRowKey={(row) => row.id} // removed onDelete
                            renderCell={(row, col) => {
                                if (["disbursed_amount", "principal_amount", "emi_amount", "total_payable", "remaining_amount"].includes(col)) {
                                    return `₹${Number(row[col] ?? 0).toLocaleString()}`;
                                }
                                if (col === "interest_rate") return `${Number(row[col] ?? 0).toFixed(2)}%`;
                                if (col === "interest_frequency")
                                    return row[col].charAt(0).toUpperCase() + row[col].slice(1);
                                if (col === "is_active")
                                    return (
                                        <span style={{ color: row[col] ? "green" : "red", fontWeight: "bold" }}>
                                            {row[col] ? "Active" : "Closed"}
                                        </span>
                                    );
                                return row[col] ?? "-";
                            }}

                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </>
                ) : (
                    <div style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
                        No loans found.
                    </div>
                )}
            </div>
        </div>
    );
}
