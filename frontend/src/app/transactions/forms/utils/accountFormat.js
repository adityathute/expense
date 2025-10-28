// ---- Shared Utility Functions ---- //

export function maskString(str, startLen = 8, endLen = 5) {
  if (!str) return "";
  if (str.length <= startLen + endLen) return str;
  return `${str.slice(0, startLen)}...${str.slice(-endLen)}`;
}

export function formatAccountOption(acc) {
  if (!acc) return "Unknown Account";

  const mode = acc.account_mode?.toLowerCase() || "";

  if (mode === "cash") {
    // For Cash accounts: show bank_service_name or fallback to name/service_name
    const name = acc.bank_service_name || acc.service_name || acc.name || "Cash";
    // Show up to 25 characters
    return name.length > 25 ? `${name.slice(0, 25)}...` : name;
  }

  if (mode === "online") {
    const holder = acc.account_holder_name || "";
    const bank = acc.bank_service_name || "";
    const acctNum = acc.account_number ? ` [****${acc.account_number.slice(-4)}]` : "";

    const holderPart = holder ? maskString(holder, 8, 5) : "";
    const bankPart = bank ? maskString(bank, 3, 5) : "";

    return [holderPart, bankPart].filter(Boolean).join(" ") + acctNum;
  }

  // fallback
  const name = acc.bank_service_name || acc.account_holder_name || acc.service_name || acc.name || "Unknown Account";
  const acctNum = acc.account_number ? ` [****${acc.account_number.slice(-4)}]` : "";
  return name.length > 20 ? `${name.slice(0, 20)}...${acctNum}` : name + acctNum;
}
