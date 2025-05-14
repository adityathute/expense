export default function BalanceCell({ value }) {
  const getBalanceClass = (val) => {
    if (val > 0) return "balance-positive";
    if (val < 0) return "balance-negative";
    return "balance-zero";
  };

  const formatBalance = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(val);

  return (
    <td className={getBalanceClass(value)}>
      ₹&nbsp;{formatBalance(value)}
    </td>
  );
}
