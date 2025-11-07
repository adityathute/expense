"use client";

import React, { useState, useEffect } from "react";
import { Banknote } from "lucide-react";
import "./style.css";
import HeaderWithNewButton from "../components/common/HeaderWithNewButton";
import StyledTable from "../components/StyledTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import LoanForm from "./LoanForm";

export default function Loans() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // open & close handlers
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const [accounts, setAccounts] = useState([]); // <-- store fetched accounts

    // ─── Fetch accounts from backend
    useEffect(() => {
        async function fetchAccounts() {
            try {
                const res = await fetch("http://127.0.0.1:8001/api/accounts/");
                const data = await res.json();
                const accountsArray = Array.isArray(data) ? data : data.results || [];
                const filtered = accountsArray.filter(acc =>
                    acc.account_mode === "Cash" || acc.account_mode === "Online"
                );
                setAccounts(filtered);

            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            }
        }

        fetchAccounts();
    }, []);

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
                <LoanForm onClose={handleCloseModal} accounts={accounts} />
            </Modal>

        </div>
    );
}
