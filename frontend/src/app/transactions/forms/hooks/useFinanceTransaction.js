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

  // Recurring fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("daily");
  const [nextDueDate, setNextDueDate] = useState("");
  const [dueRangeStart, setDueRangeStart] = useState("");
  const [dueRangeEnd, setDueRangeEnd] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [groupId, setGroupId] = useState(uuidv4());
  const [status, setStatus] = useState("planned");

  // Reset splits when core category changes
  useEffect(() => {
    if (selectedCore === "Transfer") {
      setSplits([{ account: "", amount: "" }, { account: "", amount: "" }]);
    } else {
      setSplits([{ account: "", amount: "" }]);
    }
  }, [selectedCore]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/categories/?type=${categoryType}`);
        const data = await res.json();
        const allCats = data.categories || [];
        setAllCategories(allCats);

        if (selectedCore) {
          const filteredByCore = allCats.filter(c => c.core_category === selectedCore);
          const buildTree = (items, parentId = null) =>
            items
              .filter(i => i.parent === parentId)
              .map(i => ({ ...i, children: buildTree(items, i.id) }));
          setCategories(buildTree(filteredByCore));
          setSelectedLeaf("");
          setSelectedCategory(null);
        } else {
          setCategories([]);
          setSelectedCategory(null);
        }
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [categoryType, selectedCore]);

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
      let sanitized = value.replace(/[^0-9.]/g, "");
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

    const sign = selectedCategory?.core_category === "Expense" ? -1 : 1;
    const total = splits.reduce((sum, s) => sum + Number(s.amount || 0) * sign, 0);
    setTotalAmount(total !== 0 ? total : "");
  }, [splits, selectedCategory, selectedCore]);

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
  };
}
