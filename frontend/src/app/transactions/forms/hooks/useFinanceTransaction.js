"use client";
import { useState, useEffect } from "react";

export default function useFinanceTransaction() {
  const [categoryType, setCategoryType] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coreCategories] = useState(["Income", "Expense", "Money", "Debt", "Invest", "Saving"]);
  const [selectedCore, setSelectedCore] = useState("");
  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [splits, setSplits] = useState([{ account: "", amount: "" }]);
  const [totalAmount, setTotalAmount] = useState("");

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
            items.filter(i => i.parent === parentId).map(i => ({ ...i, children: buildTree(items, i.id) }));
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

  // Split helpers
  const addSplitRow = () => setSplits([...splits, { account: "", amount: "" }]);

  const updateSplitRow = (index, field, value) => {
    const newSplits = [...splits];
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

  // Auto-calculate total
  useEffect(() => {
    const sign = selectedCategory?.core_category === "Expense" ? -1 : 1;
    const total = splits.reduce((sum, s) => sum + Number(s.amount || 0) * sign, 0);
    setTotalAmount(total !== 0 ? total : "");
  }, [splits, selectedCategory]);

  const getTotalSplitAmount = () => splits.reduce((total, s) => total + Number(s.amount || 0), 0);

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
  };
}
