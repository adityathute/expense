"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useFinanceTransaction() {
  const [categoryType, setCategoryType] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coreCategories] = useState(["Income", "Expense", "Savings", "Transfer", "Investments", "Loans", "Debts"]);
  const [selectedCore, setSelectedCore] = useState("");
  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [splits, setSplits] = useState([{ account: "", amount: "" }]);
  const [totalAmount, setTotalAmount] = useState("");
  const isTransfer = selectedCore === "Transfer";
  const [debtType, setDebtType] = useState("");

  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("daily");
  const [nextDueDate, setNextDueDate] = useState("");
  const [dueRangeStart, setDueRangeStart] = useState("");
  const [dueRangeEnd, setDueRangeEnd] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [groupId, setGroupId] = useState(uuidv4());
  const [status, setStatus] = useState("planned");

  // Loan specific
  const [emiAmount, setEmiAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");
  const [totalPayable, setTotalPayable] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [loanId, setLoanId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [loanDate, setLoanDate] = useState("");

  // Reset splits when core category changes
  useEffect(() => {
    if (selectedCore === "Transfer") {
      setSplits([{ account: "", amount: "" }, { account: "", amount: "" }]);
    } else {
      setSplits([{ account: "", amount: "" }]);
    }
  }, [selectedCore]);

  useEffect(() => {
    if (selectedCore === "Savings") {
      // Find core category object for Savings
      const coreCat = allCategories.find(c => c.core_category === "Savings" && c.is_core);
      setSelectedCategory(coreCat || { id: null, name: "Savings", core_category: "Savings" });
      setSelectedLeaf(coreCat?.id || null);
    } else {
      setSelectedLeaf("");
      setSelectedCategory(null);
    }
  }, [selectedCore, allCategories]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedCore) return;

      try {
        const res = await fetch(`http://127.0.0.1:8001/api/categories/`);

        const data = await res.json();
        const allCats = data.results || [];

        setAllCategories(allCats);
      } catch (err) {
        console.error(err);
        setAllCategories([]);
      }
    };

    fetchCategories();
  }, [selectedCore]);

  // Build tree helper
  const buildTree = (items, parentId = null) =>
    items
      .filter((i) => i.parent === parentId)
      .map((i) => ({ ...i, children: buildTree(items, i.id) }));

  // Filter categories by categoryType dynamically
  const filterByCategoryType = (nodes, type) =>
    nodes
      .map((node) => {
        const children = filterByCategoryType(node.children || [], type);
        if (node.category_type === type || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean);

  // Build category tree whenever allCategories or categoryType changes
  useEffect(() => {
    if (!allCategories.length || !selectedCore) {
      setCategories([]);
      return;
    }

    // Filter only subcategories (is_core = false) for the selected core
    const filteredByCore = allCategories.filter(
      (c) => c.core_category === selectedCore && !c.is_core
    );

    const tree = buildTree(filteredByCore);

    // Filter dynamically by categoryType
    setCategories(filterByCategoryType(tree, categoryType));
    setSelectedLeaf("");
    setSelectedCategory(null);
  }, [allCategories, selectedCore, categoryType]);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/accounts/");
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  const handleLeafChange = (e) => {
    const leafId = e.target.value;
    setSelectedLeaf(leafId);
    const catObj = allCategories.find(c => String(c.id) === String(leafId)) || null;
    setSelectedCategory(catObj);
  };

  useEffect(() => {
    if (isRecurring && status === "paid") {
      setLastPaymentDate(new Date().toISOString().split("T")[0]); // yyyy-mm-dd
    } else {
      setLastPaymentDate("");
    }
  }, [isRecurring, status]);

  // Split helpers
  const addSplitRow = () => setSplits([...splits, { account: "", amount: "" }]);

  const updateSplitRow = (index, field, value) => {
    const newSplits = [...splits];

    // Ensure row exists
    if (!newSplits[index]) newSplits[index] = { account: "", amount: "" };

    if (field === "amount") {
      let sanitized = String(value || "").replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) sanitized = parts[0] + "." + parts[1];
      if (sanitized && !sanitized.startsWith("0.")) sanitized = sanitized.replace(/^0+/, "");
      if (sanitized === "0") sanitized = "";
      newSplits[index][field] = sanitized;
    } else {
      newSplits[index][field] = value;
    }

    setSplits(newSplits);
  };


  const removeSplitRow = (index) => setSplits(splits.filter((_, i) => i !== index));

  // Total calculation
  useEffect(() => {
    if (isTransfer) {
      setTotalAmount(splits[0]?.amount || "");
      return;
    }

    let sign = 1;
    if (selectedCategory?.core_category === "Expense") sign = -1;
    if (selectedCore === "Debts" && debtType === "Lend") sign = -1;

    const total = splits.reduce((sum, s) => sum + Number(s.amount || 0) * sign, 0);
    setTotalAmount(total !== 0 ? total : "");
  }, [splits, selectedCategory, selectedCore, debtType]);

  const getTotalSplitAmount = () => {
    if (isTransfer) return Number(splits[0]?.amount || 0);
    return splits.reduce((total, s) => total + Number(s.amount || 0), 0);
  };

  return {
    categoryType,
    setCategoryType,
    allCategories,
    categories,
    coreCategories,
    selectedCore,
    setSelectedCore,
    selectedLeaf,
    setSelectedLeaf,
    selectedCategory,
    accounts,
    splits,
    totalAmount,
    addSplitRow,
    updateSplitRow,
    removeSplitRow,
    getTotalSplitAmount,
    handleLeafChange,
    isRecurring,
    setIsRecurring,
    frequency,
    setFrequency,
    nextDueDate,
    setNextDueDate,
    dueRangeStart,
    setDueRangeStart,
    dueRangeEnd,
    setDueRangeEnd,
    status,
    setStatus,
    lastPaymentDate,
    setLastPaymentDate,
    groupId,
    isTransfer,
    debtType,
    setDebtType,
    emiAmount, setEmiAmount,
    interestAmount, setInterestAmount,
    totalPayable, setTotalPayable,
    principalAmount, setPrincipalAmount,
    interestRate, setInterestRate,
    tenure, setTenure,
    loanId, setLoanId,
    partyName, setPartyName,
    loanDate, setLoanDate,
  };
}
